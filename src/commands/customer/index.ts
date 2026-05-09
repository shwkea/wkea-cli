import { Command } from 'commander';
import { registerCustomerCommands } from './crud';
import { registerBankCommands } from './bank';
import { registerContactCommands } from './contact';
import { registerInvoiceCommands } from './invoice';
import { registerAddressCommands } from './address';

export function registerCustomerModule(program: Command) {
  registerCustomerCommands(program);
  registerBankCommands(program);
  registerContactCommands(program);
  registerInvoiceCommands(program);
  registerAddressCommands(program);
}
