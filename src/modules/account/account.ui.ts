import { byId } from '../../shared/dom.ts';

// Demo registration form: native validation only; nothing is sent or stored.
export function initAccountUI(): void {
  const accountOpen = byId('account-open', HTMLButtonElement);
  const accountDialog = byId('account-dialog', HTMLDialogElement);
  const accountForm = byId('account-form', HTMLFormElement);
  const accountStatus = byId('account-status', HTMLElement);
  accountOpen.addEventListener('click', () => accountDialog.showModal());
  accountDialog.addEventListener('close', () => {
    accountOpen.focus();
    accountForm.reset();
    accountStatus.textContent = '';
  });
  accountForm.addEventListener('submit', (event) => {
    event.preventDefault();
    accountForm.reset();
    accountStatus.textContent = 'البيانات مكتملة وصيغتها صحيحة.';
  });
}
