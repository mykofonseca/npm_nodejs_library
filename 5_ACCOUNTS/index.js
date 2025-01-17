//modulos externos
const inquirer = require("inquirer");
const chalk = require("chalk");

//modeulos internos
const fs = require("fs");
const { compileFunction } = require("vm");

operation();

function operation() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "action",
                message: "O que você deseja faze?",
                choices: [
                    "Criar Conta",
                    "Consultar Saldo",
                    "Depositar",
                    "Sacar",
                    "Sair",
                ],
            },
        ])
        .then((answer) => {
            const action = answer["action"];

            if (action === "Criar Conta") {
                createAccount();
            } else if (action === "Depositar") {
                deposit();
            } else if (action === "Consultar Saldo") {
                getAccountBalance();
            } else if (action === "Sacar") {
                withdraw();
            } else if (action === "Sair") {
                console.log(chalk.bgBlue.black("Obrigado ppr usar o Accounts!"));
                process.exit();
            }
        })
        .catch((err) => console.log(err));
}

//criar uma conta
function createAccount() {
    console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
    console.log(chalk.green("Defina as opções da sua conta a seguir:"));
    buildAccount();
}

function buildAccount() {
    inquirer
        .prompt([
            {
                name: "accountName",
                message: "Digite um nome para a sua conta",
            },
        ])
        .then((answer) => {
            const accountName = answer["accountName"];
            console.info(accountName);
            if (!fs.existsSync("accounts")) {
                fs.mkdirSync("accounts");
            }
            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(
                    chalk.bgRed.black("Esta conta ja existe, escolha outro nome!")
                );

                buildAccount();
                return;
            }
            fs.writeFileSync(
                `accounts/${accountName}.json`,
                `{"balance": 0}`,
                function (err) {
                    consolel.log(err);
                }
            );

            console.log(chalk.green("Parabéns, a sua conta foi criada"));
            operation();
        })
        .catch((err) => console.log(err));
}

//adicionar uma quantidade à conta do usuário
function deposit() {
    inquirer
        .prompt([
            {
                name: "accountName",
                message: "Qual é o nome da sua conta",
            },
        ])
        .then((answer) => {
            const accountName = answer["accountName"];

            //vetificar se a conta existe
            if (!checkkAccount(accountName)) {
                return deposit();
            }
            inquirer
                .prompt([
                    {
                        name: "amount",
                        message: "Quato você deseja depositar?",
                    },
                ])
                .then((answer) => {
                    const amount = answer["amount"];

                    //adicionar uma quantidade
                    addAmount(accountName, amount);
                    operation();
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
}
function checkkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
            chalk.bgRed.black("Essa conta não existe, escolha uma conta existente!")
        );
        return false;
    }
    return true;
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if (!amount) {
        console.log(
            chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde")
        );
    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err);
        }
    );

    console.log(
        chalk.green(`Foi depositado o valor de R$${amount} na sua conta`)
    );
}
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: "utf8",
        flag: "r",
    });
    return JSON.parse(accountJSON);
}

//mostrar atual saldo da conta
function getAccountBalance() {
    inquirer
        .prompt([
            {
                name: "accountName",
                message: "Qual é o nome da sua conta",
            },
        ])
        .then((answer) => {
            const accountName = answer["accountName"];

            //verificção da existência
            if (!checkkAccount(accountName)) {
                return getAccountBalance();
            }

            const accountData = getAccount(accountName);

            console.log(
                chalk.bgBlue.black(
                    `Olá! o saldo da sua conta é de R$${accountData.balance}`
                )
            );
            operation();
        })
        .catch((err) => console.log(err));
}

function withdraw() {
    inquirer
        .prompt([
            {
                name: "accountName",
                message: "Qual é o nome da sua conta?",
            },
        ])
        .then((answer) => {
            const accountName = answer["accountName"];
            if (!checkkAccount(accountName)) {
                return withdraw();
            }

            inquirer
                .prompt([
                    {
                        name: "amount",
                        message: "Quanto você deseja sacar?",
                    },
                ])
                .then((answer) => {
                    const amount = answer["amount"];
                    removeAmount(accountName, amount);
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if (!amount) {
        console.log(
            chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
        );
        return withdraw();
    }
    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black("Valor indisponível"));
        return withdraw();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err);
        }
    );
    console.log(
        chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`)
    );
    operation();
}
