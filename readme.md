## Introduction

This project is the backend of an imaginary electronics stock.
The implementation is in Node.js.

## Setup

Follow all these steps exactly as explained below.

### Install MongoDB

To run this project, you need to install the latest version of MongoDB Community Edition first.

https://docs.mongodb.com/manual/installation/

Once you install MongoDB, make sure it's running.

### Install the Dependencies

Next, from the project folder, install the dependencies:

    npm i

### Populate the Database

    node seed.js

### Start the Server

    node app.js

This will launch the Node server on port **3000**. If that port is busy, you can set a different point in **config/default.json**.

Open up your browser and head over to:

http://localhost:3000/api/products

You should see the list of products. That confirms that you have set up everything successfully.


### Modifying data

To add or modify any of these products, you need to register for an new user. Use **Postman** to register:

http://localhost:3000/api/users/register

This will give you an auth token to modify data. Provide the token in header **"x-auth-token"** during modifying data.

In order to delete data, you should be an **"admin"**. Which will be extracted from the token payload during deleting data, to make sure that you are authorized to do this.