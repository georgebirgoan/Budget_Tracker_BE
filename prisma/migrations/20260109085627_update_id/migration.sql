-- AlterTable
CREATE SEQUENCE transaction_transactionid_seq;
ALTER TABLE "Transaction" ALTER COLUMN "transactionId" SET DEFAULT nextval('transaction_transactionid_seq');
ALTER SEQUENCE transaction_transactionid_seq OWNED BY "Transaction"."transactionId";
