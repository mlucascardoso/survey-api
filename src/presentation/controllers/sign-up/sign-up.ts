import { InvalidParamError, MissingParamError } from '../../errors';
import { badRequest, serverError, success } from '../../helpers/http';
import { AddAccount, Controller, EmailValidator, HttpRequest, HttpResponse } from './sign-up.protocols';

export class SignUpController implements Controller {
    private readonly emailValidator: EmailValidator;
    private readonly addAccount: AddAccount;

    constructor(emailValidator: EmailValidator, addAccount: AddAccount) {
        this.emailValidator = emailValidator;
        this.addAccount = addAccount;
    }

    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredFields = ['name', 'email', 'password', 'passwordConfirmation'];
            for (const field of requiredFields) {
                if (!httpRequest.body[field]) {
                    return badRequest(new MissingParamError(field));
                }
            }

            const { email, name, password, passwordConfirmation } = httpRequest.body;
            if (password !== passwordConfirmation) {
                return badRequest(new InvalidParamError('passwordConfirmation'));
            }

            const isValidEmail = this.emailValidator.isValid(email);
            if (!isValidEmail) {
                return badRequest(new InvalidParamError('email'));
            }

            const account = await this.addAccount.add({ email, name, password });
            return success(account);
        } catch (error) {
            return serverError();
        }
    }
}
