using { projectm.db as db} from '../db/schema';

service DailySalesService @(path: 'data') {

    entity sales as projection on db.DailySales;
    entity expense as projection on db.DailyExpense {
        date,
        expense,
        fixedStaffSalary,
        cast(expense + fixedStaffSalary as Decimal(15, 2)) as totalExpense
    }
    entity DailySummary as projection on db.DailySummary;

     @readonly
    entity KPIs {
        key id : String;
        totalProfitLoss : Decimal(15, 2);
        totalSales      : Decimal(15, 2);
        totalExpense    : Decimal(15, 2);
        yesterdayProfitLoss : Decimal(15, 2);
    }

}
