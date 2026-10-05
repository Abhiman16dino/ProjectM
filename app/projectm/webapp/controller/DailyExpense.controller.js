sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/VBox",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/library",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem"
], (Controller, Dialog, VBox, Input, Button, mobileLibrary, FlattenedDataset, FeedItem) => {
    "use strict";

    var ButtonType = mobileLibrary.ButtonType;

    return Controller.extend("projectm.controller.DailyExpense", {
        onInit() {
            const oChart = this.byId("expenseChart");
            const oDataset = new FlattenedDataset({
                dimensions: [{
                    name: "Date",
                    value: "{date}"
                }],
                measures: [{
                    name: "Expense",
                    value: "{totalExpense}"
                }],
                data: {
                    path: "/expense"
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
                values: ["Expense"]
            }));

            oChart.setVizProperties({
                title: {
                    visible: true,
                    text: "Daily Expense"
                }
            });
        },

        onDefaultDialogPress: function () {
            if (!this.oDefaultDialog) {
                this.oDefaultDialog = new Dialog({
                    title: "Add Todays Entry",
                    content: new VBox({
                        items: [
                            new Input({
                                id: this.createId("date-input"),
                                placeholder: "Date",
                                type: "Date"
                            }),
                            new Input({
                                id: this.createId("sales-input"),
                                placeholder: "Sales",
                                type: "Number"
                            })
                        ]
                    }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "OK",
                        press: function () {
                            const date = this.byId('date-input').getValue()
                            const expense = this.byId('sales-input').getValue()
                            const oTable = this.byId("idexpensetable");
                            const oListBinding = oTable.getBinding("items");

                            oListBinding.create({
                                date: date,
                                expense: expense
                            });

                            this.oDefaultDialog.close();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Close",
                        press: function () {
                            this.oDefaultDialog.close();
                        }.bind(this)
                    })
                });

                // to get access to the controller's model
                this.getView().addDependent(this.oDefaultDialog);
            }

            this.oDefaultDialog.open();
        },

        onViewChange: function (oEvent) {

            const sKey = oEvent.getParameter("item").getKey();
            console.log(sKey);

            const oTable = this.byId("idexpensetable");
            const oChart = this.byId("expenseChart");

            if (sKey == "table") {
                oTable.setVisible(true);
                oChart.setVisible(false);
            }
            if (sKey == "chart") {
                oTable.setVisible(false);
                oChart.setVisible(true);
            }
            if (sKey === "both") {
                oTable.setVisible(true);
                oChart.setVisible(true);
            }
        }
    });
});