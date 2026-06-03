export class InventoryDto {
  tagPatrimonial!: string;
  numSerie!: string;
  tipo!: string;
  fabricante!: string;
  modelo!: string;
  
  // Para campos opcionais, use o '?'
  hostname?: string;
  status?: string;
  cpu?: string;
  ram?: string;
  discoFisico?: string;
  emUso?: boolean;
}
