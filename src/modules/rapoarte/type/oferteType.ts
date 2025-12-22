

export type comenziFinalizateType={
codunicoferta: number;
  actiune: string;
  coduniccomanda: number;
  nume: string;
  culoare: string | null;
  totalsuprafata: number | null;
  data: Date;
}

export type comenziLucruType={
    codunicoferta:number;
    coduniccomanda:number;
    nume:string;
    culoare:string;
    totalsuprafata:number;
    data:Date;
}

export type productieType={
    ora:Date;
    suprafataprodusa :number;
}


export type produsType = {
    dataZi :Date;
    nrComenziFinalizate:number;
    suprafataProdus:number
}