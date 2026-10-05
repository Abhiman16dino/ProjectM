
import cds from "@sap/cds";

export default function () {

    this.before('CREATE', 'sales', req => {
        console.info("Creating daily sales")
        const value = req.data.sales;
        if (value < 0) {
            return req.reject(
                400,
                "Invalid sales values, must be greater then 0"
            );
        }
    });

    this.on('CREATE', 'sales', (req, next) => {
        console.info("Data is being created")
        return next()
    })

    this.after('CREATE', 'sales', () => {
        console.info("Sales Created")
    });

    // Calculate KPI data
    this.on("READ", "KPIs", async (req) => {

        const summary = await cds.tx(req).run(
            SELECT.from("projectm.db.DailySummary")
        );

        const totalSales = summary.reduce(
            (sum, row) => sum + Number(row.sales || 0),
            0
        );

        const totalExpense = summary.reduce(
            (sum, row) => sum + Number(row.totalExpense || 0),
            0
        );

        const totalProfitLoss = totalSales - totalExpense;

        // TODO: calculate yesterday's P/L
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayDate = yesterday.toISOString().split("T")[0];

        const yesterdayData = summary.find(
            row => row.date === yesterdayDate
        );

        const yesterdayProfitLoss = yesterdayData
            ? Number(yesterdayData.sales || 0) - Number(yesterdayData.totalExpense || 0)
            : 0;

        return [{
            id: "current",
            totalProfitLoss,
            totalSales,
            totalExpense,
            yesterdayProfitLoss
        }];
    });

};