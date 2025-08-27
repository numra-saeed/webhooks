## Description

This is the repository URl which includes all the changes: https://github.com/numra-saeed/webhooks. I have created a Pull Request so that you can clearly see the changes and response of github action. Here is a URl of PR:. 
If you want, feel free to merge the PR in main branch.

I have used NestJS for the implementation. The project is divided into two modules: payment-webhooks and shared/event-queue. The controller & services files are in their respective modules. The validation of input field are added using class-validator library

Moreover, the implementation includes two endpoints:

1. To see the processing of payment event without queue:
```bash
  http://localhost:3000/webhooks/payments
```

2. To see the processing of payment event with event queue:

```bash
  http://localhost:3000/webhooks/payment-events
```
Regarding event queue, I have created a built in array to mimic the behaviour of queue (for project) otherwise in production the integration with actual queue will be a bit different.


## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Instructions
1. For creating database locally make sure you have pgadmin4
2. Update the database credentials in app.module.ts
2. Run npm install and npm run build
3. Run npm run start

## Unit Testing
1. Unit tests are already added in the code for payment module
2. Run npm run test to run the test cases results
2. I also created a github action to see whether the changes are build & tested successfully.
 You can also check there whether tests are working fine or not. 

## Manual Testing
For manual testing you can use following two endpoints:

1. To see behaviour without event queue

 ```bash
curl --location 'http://localhost:3000/webhooks/payments' \
--header 'Content-Type: application/json' \
--data '{
    "event_id": "cccf9078-49d4-40b8-95e9-67441e91e2qq", 
    "type": "INVOICE_PAYMENT", 
    "invoice_id": "cccf9078-49d4-40b8-95e9-67441e91ed5d", 
    "amount_cents": 20
}
```

2. To see the behaviour of event queue

 ```bash
curl --location 'http://localhost:3000/webhooks/payment-events' \
--header 'Content-Type: application/json' \
--data '{
    "event_id": "cccf9078-49d4-40b8-95e9-67441e91e2qq", 
    "type": "INVOICE_PAYMENT", 
    "invoice_id": "cccf9078-49d4-40b8-95e9-67441e91ed5d", 
    "amount_cents": 20
}'

```

