import {Component, EventEmitter, Output, signal, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {BudgetService} from '../../core/services/budget.service';
import {CommonModule} from '@angular/common';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-add-depense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-depense.component.html',
})
export class AddDepenseComponent {
  private fb = inject(FormBuilder);
  private budgetService = inject(BudgetService);

  @Output() depenseAjoutee = new EventEmitter<void>();

  isRemboursement = signal(false);
  isSubmitting = signal(false);

  depenseForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paidByUserId: [1, Validators.required]
  });

  setRemboursement(montant: number, description: string, userId: number) {
    this.isRemboursement.set(true);
    this.depenseForm.patchValue({
      description: description,
      amount: montant,
      paidByUserId: userId
    });
  }

  onSubmit() {
    if (this.depenseForm.valid) {
      this.isSubmitting.set(true);
      const formValue = this.depenseForm.value;

      const request$ = this.isRemboursement()
        ? this.budgetService.addRemboursement({
          amount: formValue.amount,
          fromUserId: Number(formValue.paidByUserId)
        })
        : this.budgetService.addDepense(formValue);

      request$.pipe(
        finalize(() => this.isSubmitting.set(false))
      ).subscribe({
        next: () => {
          this.depenseAjoutee.emit();
          this.resetForm();
        },
        error: (err) => {
          console.error('Erreur API :', err);
          alert("Erreur lors de l'envoi. Vérifie ton terminal Backend !");
        }
      });
    }
  }

  resetForm() {
    this.isRemboursement.set(false);
    this.isSubmitting.set(false);
    this.depenseForm.reset({
      description: '',
      amount: 0,
      paidByUserId: 1
    });
  }
}
