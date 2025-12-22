import { Injectable,Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { comenziLucruType, detaliiFinalizate, productieType, produsType } from "./type/oferteType";
import { Prisma } from "@prisma/client";

@Injectable()
export class RapoarteService{
  constructor(private readonly prisma: PrismaService) {}


    async getComneziFinalizate(): Promise<comenziLucruType[]> {

    const rows = await this.prisma.$queryRaw<comenziLucruType[]>(
      Prisma.sql`
        SELECT 
            F1.codunicoferta,
            F1.actiune,
            F1.coduniccomanda,
            F2.nume,
            F2.culoare,
            F2.totalsuprafata,
            F1.data
        FROM winarhi.actiuni_2025_12 F1
        INNER JOIN winarhi.oferte_2025 F2 
            ON F1.codunicoferta = F2.codunicoferta
        WHERE 
            (F1.actiune = 'Trasmesso ad ordini finalizati'
             OR F1.actiune = 'Trecere la comenzi executate')
            AND F1.data >= CURRENT_DATE - INTERVAL '10 days'
            AND F1.data <  CURRENT_DATE + INTERVAL '1 day'
        ORDER BY F1.data DESC;
      `,
    );

    console.log("Nr coloane ",rows.length)
    return rows;
  }



    async getComenziLucru():Promise<comenziLucruType[]>{

    const rows =await this.prisma.$queryRaw<comenziLucruType[]>(
        Prisma.sql`
            SELECT
                F1.codunicoferta,
                F1.coduniccomanda,
                F2.nume,
                F2.culoare,
                F2.totalsuprafata,
                F1.data AS data_finalizare
            FROM winarhi.actiuni_2025_12 F1
            JOIN winarhi.oferte_2025 F2
                ON F1.codunicoferta = F2.codunicoferta
            WHERE F1.actiune IN (
                    'Trasmesso in produzione',
                    'Trecere în producție',
                    'Trecere înapoi în producție'
                )
            AND F1.data >= CURRENT_DATE - INTERVAL '10 days'
            AND F1.data <  CURRENT_DATE + INTERVAL '1 day'
            ORDER BY F1.data DESC;
        `
    );
     console.log("Nr coloane returnate:",rows.length)

    return rows;
  }


    async getProductie():Promise<productieType[]>{

            const rows =await this.prisma.$queryRaw<productieType[]>(
            Prisma.sql`
                SELECT
                    date_trunc('hour', F1.data) AS ora,
                    SUM(F2.totalsuprafata)   AS suprafataprodusa
                FROM winarhi.actiuni_2025_12 F1
                JOIN winarhi.oferte_2025 F2 
                    ON F1.codunicoferta = F2.codunicoferta
                WHERE F1.actiune IN (
                        'Trasmesso ad ordini finalizati',
                        'Trecere la comenzi executate'
                    )
                AND F1.data >= NOW() - INTERVAL '12 days'
                GROUP BY ora
                ORDER BY ora DESC;
            `
            );
            console.log("Nr coloane returnate productie :",rows.length)

            return rows;
        }
    
    async getProdus():Promise<produsType[]>{

    const rows =await this.prisma.$queryRaw<produsType[]>(
    Prisma.sql`
            SELECT
            date_trunc('day', F1.data)::date AS "dataZi",
            COUNT(*)::int AS "nrComenziFinalizate",
            COALESCE(SUM(F2.totalsuprafata), 0)::float AS "suprafataProdus"
            FROM winarhi.actiuni_2025_12 F1
            JOIN winarhi.oferte_2025 F2
            ON F1.codunicoferta = F2.codunicoferta
            WHERE F1.actiune IN (
            'Trasmesso ad ordini finalizati',
            'Trecere la comenzi executate'
            )
            AND F1.data >= CURRENT_DATE - INTERVAL '10 days' 
            AND F1.data <  CURRENT_DATE + INTERVAL '1 day'
            GROUP BY 1
            ORDER BY 1 DESC;

    `
    );
    console.log("Nr coloane returnate produs  :",rows.length)
    return rows;
}

 async getDetaliiFinalizate(codunicoferta:number):Promise<detaliiFinalizate[]>{

    const rows =await this.prisma.$queryRaw<detaliiFinalizate[]>(
    Prisma.sql`
           SELECT
    username,
    data,
    actiune,
    codunicoferta,
    numefisier
            FROM winarhi.vw_actiuni_ultimele_12_luni
            WHERE codunicoferta = ${codunicoferta}
            ORDER BY data;

    `
    );
    console.log("Nr coloane returnate produs  :",rows.length)
    return rows;
}

}