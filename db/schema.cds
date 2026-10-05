namespace projectm.db;
using { managed  } from '@sap/cds/common';


entity DailySales: managed {
    key date  : Date;
        sales : Decimal(15, 2) not null;
}

entity DailyExpense: managed {
    key date : Date;
        expense: Decimal(15, 2) not null;
        fixedStaffSalary: Decimal(15, 2) default 566.6667;
}

entity DailySummary as
    select from DailySales as sales
    left join DailyExpense as expense
        on sales.date = expense.date
{
    key sales.date,
        sales.sales,
        cast(
            expense.expense + expense.fixedStaffSalary
            as Decimal(15, 2)
        ) as totalExpense
};