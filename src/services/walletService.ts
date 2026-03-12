import prisma from "@/lib/prisma";

export async function creditWallet(userId: string, amount: number, type: any, refId?: string, description?: string) {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.update({
      where: { userId },
      data: {
        balance: { increment: amount }
      }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: type,
        referenceId: refId,
        description: description
      }
    });

    return wallet;
  });
}

export async function chargeWallet(userId: string, amount: number, type: any, refId?: string) {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });

    if (Number(wallet.balance) < amount) {
      throw new Error("رصيد المحفظة غير كافٍ");
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: amount }
      }
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: -amount,
        type: type,
        referenceId: refId
      }
    });

    return updatedWallet;
  });
}