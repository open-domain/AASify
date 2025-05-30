import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { AaSifyAstType, Person } from './generated/ast.js';
import type { AaSifyServices } from './aasify-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AaSifyServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AaSifyValidator;
    const checks: ValidationChecks<AaSifyAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class AaSifyValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
