"use server";

import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import db from "@/db/drizzle";
import { dailyPlans, meals } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getMealPlan(mealPlanId: number) {
  try {
    const [dailyMealPlan] = await db.query.dailyPlans.findMany({
      with: {
        meals: {
          with: {
            ingredients: true,
          },
          orderBy: asc(meals.mealOrder),
        },
      },
      where: eq(dailyPlans.id, mealPlanId),
    });

    return dailyMealPlan;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getDailyPlans() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = {
    emailAddresses: [
      {
        emailAddress: session?.user?.email!,
      },
    ],
  };

  try {
    return await db.query.dailyPlans.findMany({
      with: {
        meals: {
          with: {
            ingredients: true,
          },
          orderBy: desc(meals.createdAt),
        },
      },
      where: eq(dailyPlans.email, session?.user?.email!),
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteDailyPlan(mealPlanId: number) {
  try {
    await db.delete(dailyPlans).where(eq(dailyPlans.id, mealPlanId));

    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
