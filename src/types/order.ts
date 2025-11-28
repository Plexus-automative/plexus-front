export interface OrderLine {
  numArticle: string;
  description: string;
  prixUnitaire: number;
  quantite: number;
  quantiteDisponible: number;
  quantiteValidee: number;
  quantiteLivree: number;
  confirmation: string;
  dateLivraison: string;
}

export interface Order {
  id: number;
  name: string; // order number
  dateCommande: string;
  fournisseur: string;
  status: 1 | 2 | 3;
  lines: OrderLine[];
}
