const state = {
  token: localStorage.getItem('stockToken') || '',
  user: null,
  products: [],
  customers: [],
  editingProductId: null,
  editingCustomerId: null
};

const authTabs = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const userStatus = document.getElementById('userStatus');
const toast = document.getElementById('toast');

const productForm = document.getElementById('productForm');
const customerForm = document.getElementById('customerForm');
const productTableBody = document.getElementById('productTableBody');
const customerTableBody = document.getElementById('customerTableBody');

const productCount = document.getElementById('productCount');
const customerCount = document.getElementById('customerCount');
const inventoryValue = document.getElementById('inventoryValue');

function setAuthMode(mode) {
  authTabs.forEach((tab) => {
    const active = tab.dataset.auth === mode;
    tab.classList.toggle('active', active);
  });

  loginForm.classList.toggle('hidden', mode !== 'login');
  registerForm.classList.toggle('hidden', mode !== 'register');
}

function buildHeaders(includeBody = false) {
  const headers = {};
  if (includeBody) headers['Content-Type'] = 'application/json';
  if (state.token) headers['x-auth-token'] = state.token;
  return headers;
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.style.background = isError ? '#dc2626' : '#0f172a';
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.add('hidden'), 2600);
}

function setLoggedInUser(user) {
  state.user = user;
  userStatus.textContent = user ? `Signed in as ${user.name}` : 'Not signed in';
  logoutBtn.classList.toggle('hidden', !user);
}

function clearProductForm() {
  productForm.reset();
  state.editingProductId = null;
  document.getElementById('productId').value = '';
  document.getElementById('cancelProductEdit').classList.add('hidden');
}

function clearCustomerForm() {
  customerForm.reset();
  state.editingCustomerId = null;
  document.getElementById('customerId').value = '';
  document.getElementById('cancelCustomerEdit').classList.add('hidden');
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data || 'Request failed');
  }

  return data;
}

async function loadCurrentUser() {
  if (!state.token) {
    setLoggedInUser(null);
    return;
  }

  try {
    const user = await fetchJson('/api/users/me', {
      headers: buildHeaders()
    });
    setLoggedInUser(user);
  } catch (error) {
    localStorage.removeItem('stockToken');
    state.token = '';
    setLoggedInUser(null);
    showToast(error.message, true);
  }
}

async function loadProducts() {
  if (!state.token) {
    productTableBody.innerHTML = '<tr><td colspan="4">Login to view inventory.</td></tr>';
    productCount.textContent = '0';
    inventoryValue.textContent = '$0';
    return;
  }

  try {
    const products = await fetchJson('/api/products', {
      headers: buildHeaders()
    });
    state.products = products;
    productCount.textContent = String(products.length);
    inventoryValue.textContent = `$${products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.numberInStock || 0), 0)}`;

    productTableBody.innerHTML = products.map((product) => `
      <tr>
        <td>${product.name}</td>
        <td>$${Number(product.price).toFixed(2)}</td>
        <td>${product.numberInStock}</td>
        <td>
          <div class="action-group">
            <button class="action-btn edit" type="button" data-edit-product="${product._id}">Edit</button>
            <button class="action-btn delete" type="button" data-delete-product="${product._id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, true);
    productTableBody.innerHTML = '<tr><td colspan="4">Unable to load products.</td></tr>';
  }
}

async function loadCustomers() {
  if (!state.token) {
    customerTableBody.innerHTML = '<tr><td colspan="4">Login to view customers.</td></tr>';
    customerCount.textContent = '0';
    return;
  }

  try {
    const customers = await fetchJson('/api/customers', {
      headers: buildHeaders()
    });
    state.customers = customers;
    customerCount.textContent = String(customers.length);

    customerTableBody.innerHTML = customers.map((customer) => `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td><span class="status-pill ${customer.isGold ? 'gold' : 'default'}">${customer.isGold ? 'Gold' : 'Standard'}</span></td>
        <td>
          <div class="action-group">
            <button class="action-btn edit" type="button" data-edit-customer="${customer._id}">Edit</button>
            <button class="action-btn delete" type="button" data-delete-customer="${customer._id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, true);
    customerTableBody.innerHTML = '<tr><td colspan="4">Unable to load customers.</td></tr>';
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/users/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || 'Login failed');
    }

    const token = text.trim();
    state.token = token;
    localStorage.setItem('stockToken', token);
    loginForm.reset();
    await loadCurrentUser();
    await Promise.all([loadProducts(), loadCustomers()]);
    showToast('Login successful');
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById('registerName').value.trim(),
    email: document.getElementById('registerEmail').value.trim(),
    password: document.getElementById('registerPassword').value,
    isAdmin: document.getElementById('registerAdmin').checked
  };

  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.message || data || 'Registration failed');
    }

    const token = response.headers.get('x-auth-token');
    if (!token) {
      throw new Error('Registration succeeded but no token was returned.');
    }

    state.token = token;
    localStorage.setItem('stockToken', token);
    registerForm.reset();
    await loadCurrentUser();
    await Promise.all([loadProducts(), loadCustomers()]);
    showToast('Account created successfully');
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleProductSubmit(event) {
  event.preventDefault();

  if (!state.token) {
    showToast('Log in before managing products.', true);
    return;
  }

  const payload = {
    name: document.getElementById('productName').value.trim(),
    price: Number(document.getElementById('productPrice').value),
    numberInStock: Number(document.getElementById('productStock').value)
  };

  try {
    if (state.editingProductId) {
      await fetchJson(`/api/products/${state.editingProductId}`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify(payload)
      });
      showToast('Product updated');
    } else {
      await fetchJson('/api/products', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(payload)
      });
      showToast('Product created');
    }

    clearProductForm();
    await loadProducts();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleCustomerSubmit(event) {
  event.preventDefault();

  if (!state.token) {
    showToast('Log in before managing customers.', true);
    return;
  }

  const payload = {
    name: document.getElementById('customerName').value.trim(),
    phone: document.getElementById('customerPhone').value.trim(),
    isGold: document.getElementById('customerGold').checked
  };

  try {
    if (state.editingCustomerId) {
      await fetchJson(`/api/customers/${state.editingCustomerId}`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify(payload)
      });
      showToast('Customer updated');
    } else {
      await fetchJson('/api/customers', {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(payload)
      });
      showToast('Customer created');
    }

    clearCustomerForm();
    await loadCustomers();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function deleteProduct(id) {
  try {
    await fetchJson(`/api/products/${id}`, {
      method: 'DELETE',
      headers: buildHeaders()
    });
    showToast('Product deleted');
    await loadProducts();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function deleteCustomer(id) {
  try {
    await fetchJson(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: buildHeaders()
    });
    showToast('Customer deleted');
    await loadCustomers();
  } catch (error) {
    showToast(error.message, true);
  }
}

function handleProductRowAction(event) {
  const editId = event.target.dataset.editProduct;
  const deleteId = event.target.dataset.deleteProduct;

  if (editId) {
    const product = state.products.find((item) => item._id === editId);
    if (!product) return;

    state.editingProductId = editId;
    document.getElementById('productId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.numberInStock;
    document.getElementById('cancelProductEdit').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (deleteId) {
    deleteProduct(deleteId);
  }
}

function handleCustomerRowAction(event) {
  const editId = event.target.dataset.editCustomer;
  const deleteId = event.target.dataset.deleteCustomer;

  if (editId) {
    const customer = state.customers.find((item) => item._id === editId);
    if (!customer) return;

    state.editingCustomerId = editId;
    document.getElementById('customerId').value = customer._id;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerGold').checked = customer.isGold;
    document.getElementById('cancelCustomerEdit').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (deleteId) {
    deleteCustomer(deleteId);
  }
}

async function logout() {
  localStorage.removeItem('stockToken');
  state.token = '';
  state.user = null;
  clearProductForm();
  clearCustomerForm();
  setLoggedInUser(null);
  productTableBody.innerHTML = '<tr><td colspan="4">Login to view inventory.</td></tr>';
  customerTableBody.innerHTML = '<tr><td colspan="4">Login to view customers.</td></tr>';
  productCount.textContent = '0';
  customerCount.textContent = '0';
  inventoryValue.textContent = '$0';
  showToast('Logged out');
}

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => setAuthMode(tab.dataset.auth));
});

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
productForm.addEventListener('submit', handleProductSubmit);
customerForm.addEventListener('submit', handleCustomerSubmit);
productTableBody.addEventListener('click', handleProductRowAction);
customerTableBody.addEventListener('click', handleCustomerRowAction);
logoutBtn.addEventListener('click', logout);
document.getElementById('cancelProductEdit').addEventListener('click', clearProductForm);
document.getElementById('cancelCustomerEdit').addEventListener('click', clearCustomerForm);

setAuthMode('login');
setLoggedInUser(null);

if (state.token) {
  loadCurrentUser().then(() => Promise.all([loadProducts(), loadCustomers()]));
} else {
  productTableBody.innerHTML = '<tr><td colspan="4">Login to view inventory.</td></tr>';
  customerTableBody.innerHTML = '<tr><td colspan="4">Login to view customers.</td></tr>';
}
