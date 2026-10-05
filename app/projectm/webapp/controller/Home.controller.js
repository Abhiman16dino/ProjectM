sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem"
], (Controller, FlattenedDataset, FeedItem) => {
    "use strict";

    return Controller.extend("projectm.controller.Home", {
        onInit() {
            const oChart = this.byId("summaryChart");

            const oDataset = new FlattenedDataset({
                dimensions: [{
                    name: "Date",
                    value: "{date}"
                }],
                measures: [
                    {
                        name: "Sales",
                        value: "{sales}"
                    },
                    {
                        name: "Total Expense",
                        value: "{totalExpense}"
                    }
                ],
                data: {
                    path: "/DailySummary"
                }
            });

            oChart.setDataset(oDataset);

            oChart.addFeed(new FeedItem({
                uid: "categoryAxis",
                type: "Dimension",
                values: ["Date"]
            }));

            oChart.addFeed(new FeedItem({
                uid: "valueAxis",
                type: "Measure",
                values: ["Sales", "Total Expense"]
            }));

            oChart.setVizProperties({
                title: {
                    visible: true,
                    text: "Daily Sales vs Expense"
                }
            });
        },

        press: function (event) {
            this.getOwnerComponent().getRouter().navTo('RouteDailySales');
        },
        onPressExp: function (event) {
            console.log("Move to daily expense");
            this.getOwnerComponent().getRouter().navTo('RouteDailyExpense');
        },
        formatAmount(value) {
            return Number(value || 0).toFixed(2);
        },
        onAskChat: async function () {
            const query = this.byId("chatInput").getValue();

            if (!query) {
                return;
            }

            const url = `/odata/v4/ai/ask(question='${encodeURIComponent(query)}')`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data)

                const conversation = new sap.m.CustomListItem({
                    content: new sap.m.VBox({
                        items: [
                            new sap.m.Text({
                                text: `You: ${query}`
                            }),
                            new sap.m.Text({
                                text: `Bot: ${data.value}`
                            })
                        ]
                    })
                });

                this.byId("chatMessages").addItem(conversation);
                this.byId("chatInput").setValue("");

            } catch (error) {
                const errorMessage = new sap.m.CustomListItem({
                    content: new sap.m.Text({
                        text: "Bot: Sorry, something went wrong."
                    })
                });

                this.byId("chatMessages").addItem(errorMessage);

                console.error(error);
            }
        },

    });
});