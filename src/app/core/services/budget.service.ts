import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BalanceResponseDto, Depense, DepensesCreateDto} from '../models/budget.models';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private apiUrl = 'http://localhost:5120/api';

  constructor(private http: HttpClient) {
  }

  getBalance(): Observable<BalanceResponseDto> {
    return this.http.get<BalanceResponseDto>(`${this.apiUrl}/Balance`);
  }

  getDepense(): Observable<Depense[]> {
    return this.http.get<Depense[]>(`${this.apiUrl}/depenses`);
  }

  addDepense(dto: DepensesCreateDto): Observable<Depense> {
    return this.http.post<Depense>(`${this.apiUrl}/depenses`, dto);
  }

  deleteDepense(id: number, isRemboursement: boolean = false): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/depenses/${id}?isRemboursement=${isRemboursement}`);
  }

  addRemboursement(dto: any): Observable<any> {
    const fromId = Number(dto.fromUserId);

    const payload = {
      amount: dto.amount,
      fromUserId: fromId,
      // LOGIQUE : Si c'est le 1 qui donne, c'est pour le 2. Sinon c'est pour le 1.
      toUserId: fromId === 1 ? 2 : 1
    };

    console.log("Envoi du remboursement corrigé :", payload);
    return this.http.post(`${this.apiUrl}/remboursement`, payload);
  }
}

