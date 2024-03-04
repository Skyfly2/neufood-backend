# Neufood

## Project Creation

Created February 2022 as a Technical Entrepreneurship project and developed as a Lehigh Computer Science capstone project.

### Faculty Advisor

Tom Micklas

### Sponsors

Brad DeMassa\
Grant Kim

### Students

Rory Stein\
Thor Long\
Mike Hazaz\
Kyrie Wu

## Neufood Backend Setup

### General App Information

Node installation page can be found [here](https://nodejs.org/en/download/)\

This Project Consists of 2 repositories - [neufood-frontend](https://github.com/NeufoodCapstone/neufood-frontend) and [neufood-backend](https://github.com/NeufoodCapstone/neufood-backend)

### Building And Running the App Locally

#### Package Installation

1. To check if Node is installed on your local machine type the below commands into your terminal

```bash
$> npm -v
$> node -v
```

If you encounter an error, then you need to install node\
2. A complete guide to install node can be found [here](https://dev.to/klvncruger/how-to-install-and-check-if-node-npm-on-windows-3ho1)\
3. Clone this repository from github onto your local machine in a place of your choosing\
4. Navigate to the `~/neufood-backend` (or whatever you have named the cloned repository root) folder on your local system in the terminal\
5. Run the install command to install the necessary dependencies

```bash
$> npm install
```

6. Install Nodemon globally for hot-reloading of the changes to server files

```bash
$> npm install -g nodemon
```

7. You should now have all the necessary packages installed on your machine

#### Configuring Environment Variables

While running Neufood Backend locally, there are a set of environment variables that need to be used to make sure you are accessing the correct databases and other production instances.

1. Create a file called `.env` in the root directory of the repository
2. Copy the contents of [.env](https://docs.google.com/document/d/1HJmWSOsIh1xVDVxbja58afgPjwkw71O4Wsyq0ARcpV4/edit) into the `.env` file

#### Running Neufood Backend

1. Now that everything is up to date we will start the app by navigating to the root directory of the repository (i.e. `~/neufood-backend`)
2. To run the app locally with hot-reloading on any file change, type the below command into your terminal instance (recommended)

```bash
$> nodemon index.js
```

3. To run the app locally without hot-reloading (you will have to manually shut-down and restart the server any time you change a file in the server), type the below command into your terminal instance (not recommended)

```bash
$> node index.js
```

3. The server will be hosted at the displayed address in your terminal

4. To stop the app from running, press `Ctrl-C` in your terminal instance

#### Deployment

The production version of the backend can be found at [https://fair-lime-harp-seal-gown.cyclic.cloud](https://fair-lime-harp-seal-gown.cyclic.cloud)

1. To deploy the Neufood Backend, create a pull request with your changes
2. Once the pull request is approved, squash and merge your feature branch into the `main` branch
3. Once merged, GitHub has a webhook set up with Cyclic to automatically deploy the `main` branch to production
4. After a few minutes, if you see a green checkmark next to the commit hash on the `main` branch, the backend has been successfully deployed to production
5. If at any time, you see a red "X" next to the commit hash on the `main` branch, the deployment has failed. Sign into [Cyclic](https://www.cyclic.sh/) with the `NeufoodCapstone` GitHub account and select the project to view the terminal to diagnose the error

#### Testing the Application

NeuFood uses Jest as its primary testing framework. All tests written should test a single file.
All tests should go in the `/src/test` directory with the same path of the file that is being
tested in the corresponding backend folder
(i.e. testing the file `/src/pages/friend.js` would be placed in the file
`/src/test/backend/src/pages/friend.test.js`). All testing files need to have `.test` after
the filename and before `.js` to be run automatically.

In order to run all the unit tests, cd to the root directory and simply run the command:

```bash
$> npx jest
```

Following this, you will be told the number of tests that pass and the number of tests that fail,
including the name and suites of the failing tests.

If you only want to run specific suites of unit tests, run the command:

```bash
$> npx jest <path-to-file>
```

If you want to run every suite of unit tests in a directory, run the command:

```bash
$> npx jest <path-to-directory>/
```

If you want to run every suite of tests with a particular pattern in the name, run the command:

```bash
$> npx jest --testPathPattern=<pattern>
```

ALL tests must pass before you submit a pull request. Failing tests MUST be remedied before review

#### Uninstalling node

1. A guide to uninstall node can be found [here](https://reactgo.com/uninstall-node-npm-from-windows/)
2. Restart your system to apply changes
