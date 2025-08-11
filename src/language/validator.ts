import type { ValidationAcceptor, ValidationChecks } from 'langium';
import * as ast from './generated/ast.js';
import type { AasifyServices } from './module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AasifyServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AasifyValidator;
    const checks: ValidationChecks<ast.AASifyAstType> = {
        AasDefinition: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class AasifyValidator {

    checkPersonStartsWithCapital(aas_definition_element: ast.AasDefinition, accept: ValidationAcceptor): void {
        if (aas_definition_element.name) {
            const firstChar = aas_definition_element.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: aas_definition_element, property: 'name' });
            }
        }
    }

}
