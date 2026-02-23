import {Component, computed, OnInit, signal, viewChild} from '@angular/core';
import {BalanceResponseDto, Depense} from '../../../core/models/budget.models';
import {CommonModule} from '@angular/common';
import {BudgetService} from '../../../core/services/budget.service';
import {Router} from '@angular/router';
import {AddDepenseComponent} from '../../add-depense.component/add-depense.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, AddDepenseComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  addDepenseComp = viewChild(AddDepenseComponent);

  balance = signal<BalanceResponseDto | undefined>(undefined);
  historique = signal<Depense[]>([]);


  totalGeneral = computed(() => {
    return this.historique()
      .filter(item => !item.isRemboursement)
      .reduce((acc, item) => acc + item.amount, 0);
  });

  totalMathieu = computed(() => {
    return this.historique()
      .filter(item => item.paidByUserId === 1 && !item.isRemboursement)
      .reduce((acc, item) => acc + item.amount, 0);
  });

  totalCaroline = computed(() => {
    return this.historique()
      .filter(item => item.paidByUserId === 2 && !item.isRemboursement)
      .reduce((acc, item) => acc + item.amount, 0);
  });

  constructor(private budgetService: BudgetService) {
  }

  ngOnInit() {
    this.chargerDonnees();
  }

  chargerDonnees() {
    this.budgetService.getBalance().subscribe({
      next: (res) => this.balance.set(res),
      error: (err) => {
        console.error("Erreur de balance :", err);
        alert("Impossible de récupérer la balance. Vérifie que le serveur est lancé !");
      }
    });

    this.budgetService.getDepense().subscribe({
      next: (res) => this.historique.set(res),
      error: (err) => console.error("Erreur d'historique :", err)
    });
  }

  supprimerEntree(item: Depense) {
    const message = item.isRemboursement
      ? "Supprimer ce remboursement ?"
      : "Supprimer cette dépense ?";

    if (confirm(message)) {
      this.budgetService.deleteDepense(item.id, item.isRemboursement).subscribe(() => {
        this.chargerDonnees();
      });
    }
  }

  ouvrirRembousementManuel() {
    const b = this.balance();
    const component = this.addDepenseComp();
    if (!b || !component) return;

    const quiDoit = b.currentBalance < 0 ? 1 : 2;
    const resteADu = Math.abs(b.currentBalance);

    component.setRemboursement(
      resteADu,
      `Remboursement à ${quiDoit === 1 ? b.user2Name : b.user1Name}`,
      quiDoit
    );
  }

  remboursementTotal() {
    const b = this.balance();
    if (!b || b.currentBalance === 0) return;

    const quiDoit = b.currentBalance < 0 ? 1 : 2;
    const montant = Math.abs(b.currentBalance);
    const destinataire = quiDoit === 1 ? b.user2Name : b.user1Name;

    if (confirm(`Confirmer le remboursement de ${montant}€ à ${destinataire} ?`)) {
      // On appelle addRemboursement et non addDepense !
      this.budgetService.addRemboursement({
        amount: montant,
        fromUserId: quiDoit
      }).subscribe(() => {
        this.chargerDonnees();
      });
    }
  }
}

