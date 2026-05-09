import { Command } from 'commander';
import { registerCrudCommands } from './crud';
import { registerListCommand } from './list';
import { registerDropdownCommand } from './dropdown';
import { registerVendorBrandCommands } from './brands';
import { registerCategoryCommands } from './categories';
import { registerAdvancedCommands } from './advanced';
import { registerContactCommands } from './contact';
import { registerSuperiorCategoryCommands } from './superior-category';
import { registerBankCommands } from './bank';
import { registerInvoiceCommands } from './invoice';
import { registerAddressCommands } from './address';
import { registerVendorUrlCommands } from './vendor-url';

export function registerVendorCommands(program: Command) {
  registerCrudCommands(program);
  registerListCommand(program);
  registerDropdownCommand(program);
  registerVendorBrandCommands(program);
  registerCategoryCommands(program);
  registerAdvancedCommands(program);
  registerContactCommands(program);
  registerSuperiorCategoryCommands(program);
  registerBankCommands(program);
  registerInvoiceCommands(program);
  registerAddressCommands(program);
  registerVendorUrlCommands(program);
}
