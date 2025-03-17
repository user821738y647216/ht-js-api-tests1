const axios = require('axios');
const { expect } = require('chai');

describe('Create User API Tests', () => {
    const apiUrl = 'https://bookstore.demoqa.com/Account/v1/User';
    let existingUserName;
    let userId; // Для сохранения ID созданного пользователя

    before(async () => {
        // Создаем пользователя перед тестами для проверки дублирования имени
        existingUserName = `existingUser_${Date.now()}`;
        const validPassword = 'Password1!';

        try {
            const response = await axios.post(apiUrl, {
                userName: existingUserName,
                password: validPassword
            });
            userId = response.data.userID;
        } catch (error) {
            throw new Error(`Failed to create user for setup: ${error.message}`);
        }
    });

    it('should create a new user with valid credentials', async () => {
        const uniqueUserName = `testuser_${Date.now()}`;
        const validPassword = 'Password1!';

        const requestBody = {
            userName: uniqueUserName,
            password: validPassword
        };

        try {
            const response = await axios.post(apiUrl, requestBody);

            expect(response.status).to.equal(201);
            expect(response.data).to.have.property('userID');

            console.log(`User created successfully with ID: ${response.data.userID}`);
        } catch (error) {
            if (error.response) {
                console.error('Error Response Data:', error.response.data);
                throw new Error(`Failed to create user: ${error.response.statusText}`);
            } else {
                throw new Error(`Request failed: ${error.message}`);
            }
        }
    });

    it('should fail to create a user with an already existing username', async () => {
        const requestBody = {
            userName: existingUserName, // Используем ранее созданное имя пользователя
            password: 'Password1!'
        };

        try {
            await axios.post(apiUrl, requestBody);
        } catch (error) {
            // Проверяем статус ошибки и содержимое ответа
            expect(error.response.status).to.equal(406); // Ожидаемый статус для ошибки "Пользователь уже существует"
            expect(error.response.data).to.have.property('message', 'User exists!');
            console.log('Correctly handled duplicate username error.');
        }
    });

    it('should fail to create a user with an invalid password', async () => {
        const uniqueUserName = `invalidUser_${Date.now()}`;
        const invalidPassword = 'short'; // Невалидный пароль (не соответствует требованиям)

        const requestBody = {
            userName: uniqueUserName,
            password: invalidPassword
        };

        try {
            await axios.post(apiUrl, requestBody);
        } catch (error) {
            // Проверяем статус ошибки и содержимое ответа
            expect(error.response.status).to.equal(400); // Ожидаемый статус для ошибки "Невалидный пароль"
            expect(error.response.data).to.have.property('message').that.includes('Passwords must have at least one non alphanumeric character');
            console.log('Correctly handled invalid password error.');
        }
    });
    describe('Generate Token API Tests', () => {
        const apiUrl = 'https://bookstore.demoqa.com/Account/v1/GenerateToken';
    
        // Данные для успешной генерации токена
        const validCredentials = {
            userName: 'testuser', // Замените на существующее имя пользователя
            password: 'Password1!' // Замените на правильный пароль
        };
    
        // Данные для генерации токена с ошибкой
        const invalidCredentials = {
            userName: 'testuser',
            password: 'wrongpassword' // Неверный пароль
        };
    
        it('should successfully generate a token with valid credentials', async () => {
            try {
                const response = await axios.post(apiUrl, validCredentials);
    
                // Проверяем статус ответа
                expect(response.status).to.equal(200);
    
                // Проверяем структуру ответа
                const responseBody = response.data;
                expect(responseBody).to.have.property('token').that.is.a('string');
                expect(responseBody).to.have.property('expires').that.is.a('string');
                expect(responseBody).to.have.property('status').that.is.a('string');
                expect(responseBody).to.have.property('result').that.is.a('string');
    
                console.log('Token generated successfully:', responseBody.token);
            } catch (error) {
                if (error.response) {
                    console.error('Error Response Data:', error.response.data);
                    throw new Error(`Failed to generate token: ${error.response.statusText}`);
                } else {
                    throw new Error(`Request failed: ${error.message}`);
                }
            }
        });
    
        it('should fail to generate a token with invalid credentials', async () => {
            try {
                await axios.post(apiUrl, invalidCredentials);
            } catch (error) {
                // Проверяем статус ответа
                expect(error.response.status).to.equal(400);
    
                // Проверяем структуру ответа
                const responseBody = error.response.data;
                expect(responseBody).to.have.property('code').that.is.a('number');
                expect(responseBody).to.have.property('message').that.is.a('string');
    
                console.log('Correctly handled invalid credentials error:', responseBody.message);
            }
        });
    });

});