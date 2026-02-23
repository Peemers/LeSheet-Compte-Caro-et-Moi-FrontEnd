export interface BalanceResponseDto {

  user1Name: string;
  user2Name: string;
  TotalPayeParUser1: number;
  TotalPayeParUser2: number;
  currentBalance : number;
  recommendation : string;
}

export interface Depense{
  id: number;
  description: string;
  amount: number;
  date: string;
  paidByUserId : number;
  isRemboursement : boolean;
}

export interface DepensesCreateDto{
  description: string;
  amount: number;
  paidByUserId : number;
}
