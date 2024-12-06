sap.ui.define(
    [
        'sap/ui/core/mvc/ControllerExtension',
        "sap/m/MessageToast",
        'sap/m/SearchField',
        'sap/ui/model/FilterOperator',
        'sap/ui/model/Filter',
        // 'sap/ui/core/mvc/OverrideExecution',
        'ehs/fnd/task/insts1/ext/controller/ObjectPageExtension.controller'
    ],
    function (
        ControllerExtension, MessageToast, Filter, FilterOperator, ObjectPageExtensionController
        // ,OverrideExecution
    ) {
        'use strict';
        const originalPrototype = { ...DeliveryController.prototype };

        DeliveryController.prototype.onChangeDueDatePress = function(oEvent) {

        // do whatever custom stuff you need
        console.log("on change due date is triggered")

        // you can still call the original method too
        // originalPrototype.onChangeDueDatePress.apply(this, arguments);
    };
    
        return ControllerExtension.extend("customer.task.variant.addassignee", {

            // metadata: {
            // 	// extension can declare the public methods
            // 	// in general methods that start with "_" are  private
            // 	methods: {
            // 		publicMethod: {
            // 			public: true /*default*/ ,
            // 			final: false /*default*/ ,
            // 			overrideExecution: OverrideExecution.Instead /*default*/
            // 		},
            // 		finalPublicMethod: {
            // 			final: true
            // 		},
            // 		onMyHook: {
            // 			public: true /*default*/ ,
            // 			final: false /*default*/ ,
            // 			overrideExecution: OverrideExecution.After
            // 		},
            // 		couldBePrivate: {
            // 			public: false
            // 		}
            // 	}
            // },

            // // adding a private method, only accessible from this controller extension
            // _privateMethod: function() {},
            // // adding a public method, might be called from or overridden by other controller extensions as well
            //    publicMethod: function() {
            // onAdd: function() {
            //     MessageToast.show("Add is pressed");
            // }

            //    },
            // // adding final public method, might be called from, but not overridden by other controller extensions as well
            // finalPublicMethod: function() {},
            // // adding a hook method, might be called by or overridden from other controller extensions
            // // override these method does not replace the implementation, but executes after the original method
            // onMyHook: function() {},
            // // method public per default, but made private via metadata
            // couldBePrivate: function() {},
            // // this section allows to extend lifecycle hooks or override public methods of the base controller
            override: {
                /**
                 * Called when a controller is instantiated and its View controls (if available) are already created.
                 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
                 * @memberOf {{controllerExtPath}}
                 */
                onInit: function () {
                    // let publicMethod = this.
                    this.oModel_odata = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZAPI_EHHSSD_TDEF_ADD_O2/"); // Assuming the model is already set to your view
                    this.getView().setModel(this.oModel_odata, "customer.add_assignee");
                    
                    console.log("into the init");
                },
                /**
                 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
                 * (NOT before the first rendering! onInit() is used for that one!).
                 * @memberOf {{controllerExtPath}}
                 */
                onBeforeRendering: function () {
                    // this.oModel_odata = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZAPI_EHHSSD_TDEF_ADD_O2/"); // Assuming the model is already set to your view
                    // this.getView().setModel(this.oModel_odata, "customer.add_assignee");
                    this.TaskUUID_G = "00000000-0000-0000-0000-000000000000";
                    this.oTaskData = [];

                },
                /**
                 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
                 * This hook is the same one that SAPUI5 controls get after being rendered.
                 * @memberOf {{controllerExtPath}}
                 */
                onAfterRendering: function () {
                    
                    var oModel = this.getView().getModel("customer.add_assignee");
                    var oModel1 = this.getView().getModel(); // Get the model bound to the view
                    var sPath = this.getView().getBindingContext().getPath(); // Retrieve the binding context path

                    var oUserInfo = sap.ushell.Container.getUser();
                    var sUserId = oUserInfo.getId(); // Get the logged-in user ID
                    var sFullName = 'Ragunathan T';   //oUserInfo.getFullName(); // Get the user's full name

                    oModel1.read(sPath, {
                        success: function (oData) {
                            this.TaskUUID_G = oData.EHSPlannedTaskUUID;
                            var TaskOwner = '9980000080';  //oData.EHSTaskAssignedBP;
                            if (oModel) {
                                // Perform the read operation on the OData service
                                oModel.read("/add_assignee", {
                                    filters: [new sap.ui.model.Filter("TaskUUID", sap.ui.model.FilterOperator.EQ, this.TaskUUID_G)],
                                    success: function (oData) {
                                        var oTaskData = {
                                            save_button_status: false,
                                            add_button_status: true,
                                            edit_button_status: true,
                                            results: oData.results.map(item => ({
                                                ...item, // Retain all existing properties of the object
                                                isEditable: false, // Add a new property `isEditable` with a default value of `false`
                                                DueDate: item.DueDate ? new Date(item.DueDate).toISOString().slice(0, 10) : null
                                            })).sort((a, b) => {
                                                // Assuming TaskID is a string; adjust if it's a number
                                                if (a.TaskID < b.TaskID) return -1;
                                                if (a.TaskID > b.TaskID) return 1;
                                                return 0;
                                            })
                                        };
                                        this.int_row = oData.results ? oData.results.length : 0;
                                        var oTaskModel = new sap.ui.model.json.JSONModel(oTaskData); // Use `oData.results` for OData lists
                                        this.getView().setModel(oTaskModel, "taskModel");
                                    }.bind(this),
                                    error: function (oError) {
                                        console.error(oError);  // Handle error
                                    }
                                });
                                oModel.read("/vh_person", {
                                    success: function (oData) {
                                        this.oTaskData = {
                                            results1: oData.results
                                        };
                                        var oTaskModel = new sap.ui.model.json.JSONModel(this.oTaskData); // Use `oData.results` for OData lists
                                        this.getView().setModel(oTaskModel, "taskModel1");
                                        var matchedEntry_taskowner = this.oTaskData.results1.find(function (entry) {
                                            return entry.BusinessPartner === TaskOwner;
                                        });
                                        var matchedEntry_loggeduser = this.oTaskData.results1.find(function (entry) {
                                            return entry.BusinessPartnerName === sFullName;
                                        });
                                        if(matchedEntry_taskowner.BusinessPartnerName == sFullName){
                                            this.taskowner = true;
                                        }else{
                                            this.taskowner = false;
                                            this.user_BP = matchedEntry_loggeduser.BusinessPartner;
                                        }
                                        // console.log(matchedEntry.BusinessPartner);
                                    }.bind(this),
                                    error: function (oError) {
                                        console.error(oError);  // Handle error
                                    }
                                });
                            } else {
                                MessageToast.show("OData model not found");
                            }
                        }.bind(this),
                        error: function (oError) {
                            console.error("Error fetching data for path:", sPath, oError);
                        }
                    });
                    var oButton = sap.ui.getCore().byId("ehs.fnd.task.insts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_EHSTaskInstance--action::changeDueDateAction");
                    if (oButton) {
                        // Perform operations on the button
                        oButton.setEnabled(false); // Example: Disable the button
                    }

                    console.log("User ID:", sUserId);
                    console.log("Full Name:", sFullName);

                },
                /**
                 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
                 * @memberOf {{controllerExtPath}}
                 */
                onExit: function () {
                },
                // override public method of the base controller
                basePublicMethod: function () {
                },
                onNodePressTask: function(e){
                    console.log("node in")
                }

            },
            onInputChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();
            
                if (!sValue) {
                    // Set error state if value is empty
                    oInput.setValueState("Error");
                    oInput.setValueStateText("This field is mandatory");
                } else {
                    // Reset value state if input is valid
                    oInput.setValueState("None");
                }
            },
            onAdd: function () {
                // var oButton = sap.ui.getCore().byId("ehs.fnd.task.insts1::sap.suite.ui.generic.template.ObjectPage.view.Details::C_EHSTaskInstance--action::changeDueDateAction");
                // if (oButton) {
                //     // Perform operations on the button
                //     oButton.setEnabled(false); // Example: Disable the button
                // }
                
            
                this.status_add = true;

                var oModel = this.getView().getModel("taskModel");  // Access the model bound to the table
                var bCurrentStatus = oModel.getProperty("/save_button_status");
                if (!bCurrentStatus){
                    this.set_edit_button_status();
                    this.set_save_button_status();
                }
                // Check if the model exists
                if (!oModel) {
                    MessageToast.show("Model not found!");
                    return;
                }


                // Get the existing data from the model
                var aData = oModel.getProperty("/results"); // Access the 'results' array

                // Check if the 'results' array exists
                if (!Array.isArray(aData)) {
                    aData = []; // Initialize as an empty array if it doesn't exist
                }


                // Retrieve the last element of the array if it exists
                var oLastRowID = parseInt(
                    aData.length > 0 ? aData[aData.length - 1].TaskID.split("-").pop() || "0" : "0",
                    10
                );
                const numericPart = (oLastRowID + 1).toString().padStart(12, "0"); // Ensure the numeric part is 12 characters long
                const taskIDFormatted = `00000000-0000-0000-0000-${numericPart}`;

                // Create a new row object with values from the last row (if available)
                var oNewRow = {
                    TaskUUID: this.TaskUUID_G,  // Map TaskUUID from last row or set to default
                    TaskID: this._generateGuid(),      // Map TaskID from last row or set to default
                    AddpersonID: "",  // Default value for AddPersonID
                    PersonName: "",   // Default value for PersonName
                    Description: "",
                    DueDate: "",      // Default value for Description
                    Status: "",       // Default value for Status
                    isEditable: true
                };
                // Append the new row to the 'results' array
                aData.push(oNewRow);

                // Update the 'results' array in the model
                oModel.setProperty("/results", aData);

            },
            onEdit: function() {
                var oModel = this.getView().getModel("taskModel");
                    if (this.aSelectedData != null) {
                        if(this.taskowner){
                            var sCurrentStatus = oModel.getProperty("/save_button_status");
                            var aCurrentStatus = oModel.getProperty("/add_button_status");
                            if(!sCurrentStatus){
                                // Set the opposite value
                                oModel.setProperty("/save_button_status", !sCurrentStatus);
                            }
                            if(aCurrentStatus){
                                oModel.setProperty("/add_button_status", !aCurrentStatus);
                            }
                        
                            // Update `isEditable` for all rows
                            // this.aSelectedData.forEach(row => {
                            //     row.isEditable = true; // Set isEditable to true
                            // });
                        
                            if (oModel) {
                                var oData = oModel.getData();
                                
                                // Update the rows in the model
                                oData.results.forEach(item => {
                                    const selectedRow = this.aSelectedData.find(row => row.TaskID === item.TaskID);
                                    if (selectedRow) {
                                        item.isEditable = true; // Update isEditable for matching rows
                                    } else {
                                        item.isEditable = false;
                                    }
                                });
                        
                                oModel.setData(oData); // Refresh the model
                            }
                        } else {
                            var selectedRow_assignee = this.aSelectedData.find(row => row.AddpersonID === this.user_BP);
                            if(selectedRow_assignee){
                                var sCurrentStatus = oModel.getProperty("/save_button_status");
                                var aCurrentStatus = oModel.getProperty("/add_button_status");
                                if(!sCurrentStatus){
                                    // Set the opposite value
                                    oModel.setProperty("/save_button_status", !sCurrentStatus);
                                }
                                if(aCurrentStatus){
                                    oModel.setProperty("/add_button_status", !aCurrentStatus);
                                }
                            
                                // Update `isEditable` for all rows
                                // this.aSelectedData.forEach(row => {
                                //     row.isEditable = true; // Set isEditable to true
                                // });
                            
                                if (oModel) {
                                    var oData = oModel.getData();
                                    
                                    // Update the rows in the model
                                    oData.results.forEach(item => {
                                        const selectedRow = this.aSelectedData.find(row => row.TaskID === item.TaskID);
                                        if(selectedRow){
                                            if (selectedRow.AddpersonID == this.user_BP) {
                                                item.isEditable = true; // Update isEditable for matching rows
                                            }
                                        }
                                    });
                            
                                    oModel.setData(oData); // Refresh the model
                                }
                                MessageToast.show("Correct Assignee!");
                            } else {
                                this.refresh_model();
                                MessageToast.show("You do not have authorization to edit this Assignee!");
                            }
                        }
                    } else {
                    
                        var sCurrentStatus = oModel.getProperty("/save_button_status");
                        var aCurrentStatus = oModel.getProperty("/add_button_status");
                        if(sCurrentStatus){
                            // Set the opposite value
                            oModel.setProperty("/save_button_status", !sCurrentStatus);
                        }
                        if(!aCurrentStatus){
                            oModel.setProperty("/add_button_status", !aCurrentStatus);
                        }
                        if (oModel) {
                            var oData = oModel.getData();
                            
                            // Update the rows in the model
                            oData.results.forEach(item => {
                                // const selectedRow = this.aSelectedData.find(row => row.TaskID === item.TaskID);
                                if (item.isEditable) {
                                    item.isEditable = false; // Update isEditable for matching rows
                                }
                            });
                    
                            oModel.setData(oData); // Refresh the model
                        }
                        MessageToast.show("Please select Assignee!");
                    }
            },
            onDelete: function () {
                if (this.aSelectedData) {
                    console.log("Original Selected Rows Data:", this.aSelectedData);
                
                    // Copy `this.aSelectedData` into a new array and remove `isEditable`
                    var aProcessedData = this.aSelectedData.map(row => {
                        // Create a shallow copy of the row without `isEditable`
                        let { isEditable, ...rest } = row; 
                        return rest;
                    });
                    this.onBatch_DataUpdate(aProcessedData,"Delete");
                } else {
                    MessageToast.show("Select Assignee's to Delete");
                }
            },
            onSelectionChange: function (oEvent) {
                this.aSelectedData = null;
                var oTable = oEvent.getSource(); // Event source is the table
                var aSelectedContexts = oTable.getSelectedContexts("taskModel"); // Get binding contexts of selected rows
                if(aSelectedContexts.length > 0){
                    this.aSelectedData = aSelectedContexts.map(function (oContext) {
                        return oContext.getObject(); // Get data object for each selected row
                    });
                }
            },
            onSave: function () {
                // Get the taskModel
                var oModel = this.getView().getModel("taskModel");
                var aData = oModel.getProperty("/results"); // Fetch all rows in the model

                // Find rows where isEditable = true and AddpersonID is empty
                var invalidRows = aData.filter(function (row) {
                    return row.isEditable === true && (!row.AddpersonID || row.AddpersonID.trim() === "" || row.DueDate === "");
                });

                if (invalidRows.length == 0) {
                    if(this.status_add){ 
                        this.status_add = false;
                        this.oModel_odata.read("/add_assignee", {
                            filters: [new sap.ui.model.Filter("TaskUUID", sap.ui.model.FilterOperator.EQ, this.TaskUUID_G)],
                            success: function (oData) {
                                if (oModel) {
                                    // Retrieve data from the model 
                                    var aData = oModel.getData(); // This retrieves the data from the JSON model

                                    // Check if it's an array and log the length
                                    var iLength = Array.isArray(aData) ? aData.length : (aData.results ? aData.results.length : 0);
                                    
                                    if (iLength > this.int_row) {
                                        // Extract items from oData.results[this.int_row] to oData.results[iLength_sPath - 1]
                                        var slicedODataResults = aData.results.slice(this.int_row, iLength);

                                        // Map and construct the new array with required modifications
                                        var aUpdatedSet = slicedODataResults.map((item) => {
                                            
                                            return {
                                                TaskUUID: item.TaskUUID, // Fill TaskUUID with a fixed value
                                                TaskID: item.TaskID, // Use the formatted TaskID
                                                AddpersonID: item.AddpersonID, // Retain existing value from `oData.results`
                                                PersonName: item.PersonName, // Fill PersonName with "Tulasi"
                                                Description: item.Description, // Retain existing Description
                                                DueDate: item.DueDate ? new Date(new Date(item.DueDate).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19) : null, // Format as "YYYY-MM-DDTHH:mm:ss"
                                                Status: item.Status || "01" // If Status is empty, set it to "01"
                                            };
                                        });
                                        // calling method to refresh model
                                        this.onBatch_DataUpdate(aUpdatedSet, "Create");
                                    } else {
                                        // implement logic for delete
                                    }
                                } else {
                                    console.error("Model 'taskModel' not found");
                                }
                            }.bind(this),
                            error: function (oError) {
                                console.error("Error fetching data from /add_assignee:", oError); // Handle errors
                            }
                        });

                    } else {
                        if (this.aSelectedData) {
                            // Copy `this.aSelectedData` into a new array and remove `isEditable`
                            var aProcessedData = this.aSelectedData.filter(row => row.isEditable).map(row => {
                                // Convert DueDate to the desired format and create a shallow copy of the row
                                let { isEditable, DueDate, ...rest } = row; 
                                return {
                                    ...rest,
                                    DueDate: DueDate ? new Date(new Date(DueDate).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19) : null // Convert to `YYYY-MM-DDTHH:mm:ss`
                                };
                            });

                            this.onBatch_DataUpdate(aProcessedData,"Update");
                        }
                    }
                } else {
                    // Display error message and prevent further execution
                    sap.m.MessageToast.show("Please fill all mandatory fields for editable rows.");
                    return; // Stop execution
                }
                    MessageToast.show("Save is pressed");
            },
            _generateGuid: function () {
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                  /[xy]/g,
                  function (m) {
                    var r = (Math.random() * 16) | 0;
                    var g = m === "x" ? r : (r & 0x3) | 0x8;
                    return g.toString(16);
                  }
                );
              },
            // formatToDate: function(dateString) {
            //     const date = new Date(dateString);
            
            //     // Format the date in UTC
            //     const options = {
            //         year: 'numeric',
            //         month: '2-digit',
            //         day: '2-digit',
            //         timeZone: 'UTC' // Specify UTC
            //     };
            
            //     // Format the date using the UTC time zone
            //     return new Intl.DateTimeFormat('en-CA', options).format(date);
            // },
            onBatch_DataUpdate: function (updated_assignees, operation) {
                // Enable batch processing
                this.oModel_odata.setDeferredGroups(["batchGroup"]);

                if(operation == "Create"){
                    // Add each entry as a create request
                    var uPath = "/add_assignee";
                    updated_assignees.forEach(function (addRow) {
                        this.oModel_odata.create(uPath, addRow, {
                            groupId: "batchGroup"
                        });
                    }.bind(this));
                } else if(operation == "Update") {
                    // Add each entry as an update request
                    updated_assignees.forEach(function (updateRow) {
                        var uPath = `/add_assignee(TaskUUID=guid'${updateRow.TaskUUID}',TaskID=guid'${updateRow.TaskID}')`; // Correct path format for GUIDs
                        this.oModel_odata.update(uPath, updateRow, {
                            groupId: "batchGroup"
                        });
                    }.bind(this));
                    this.aSelectedData = null;
                } else if(operation == "Delete") {
                    updated_assignees.forEach(function (updateRow) {
                        var uPath = `/add_assignee(TaskUUID=guid'${updateRow.TaskUUID}',TaskID=guid'${updateRow.TaskID}')`; // Correct path format for GUIDs
                        this.oModel_odata.remove(uPath, updateRow, {
                            groupId: "batchGroup"
                        });
                    }.bind(this));
                    this.aSelectedData = null;
                }
            
                // Submit the batch group
                this.oModel_odata.submitChanges({
                    groupId: "batchGroup",
                    success: function (oData) {
                        sap.m.MessageBox.success(`Records ${operation}d Successfully`);
                        console.log("Batch Save Success Response: ", oData);
                        this.refresh_model();
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error("Failed to create records");
                        console.error("Batch Save Error Response: ", oError);
                        this.refresh_model();
                    }
                });
            },
            // onDateChange: function (oEvent) {
            //     const sNewValue = oEvent.getParameter("value"); // Get the new value from the DatePicker
            //     const oSource = oEvent.getSource(); // The DatePicker instance
            //     const sPath = oSource.getBindingContext("taskModel").getPath(); // Get the binding path, e.g., "/results/0"
            
            //     // Format the new value
            //     const oDate = new Date(sNewValue);
            //     const options = { year: "numeric", month: "short", day: "2-digit" };
            //     const sFormattedDate = oDate.toLocaleDateString("en-US", options).replace(",", "");
            
            //     // Update the specific entry in the results array
            //     const oModel = this.getView().getModel("taskModel");
            //     oModel.setProperty(sPath + "/DueDate", sFormattedDate); // Update the DueDate field for the specific array entry
            // },                        
            refresh_model: function(){
                // Refresh the OData model
                if (this.oModel_odata) {
                    this.oModel_odata.refresh(true);
                    console.log("OData model refreshed.");
                    
                    // Perform the read operation on the OData service
                    this.oModel_odata.read("/add_assignee", {
                        filters: [new sap.ui.model.Filter("TaskUUID", sap.ui.model.FilterOperator.EQ, this.TaskUUID_G)],
                        success: function (oData) {
                            var oTaskData = {
                                save_button_status: false,
                                add_button_status: true,
                                edit_button_status: true,
                                results: oData.results.map(item => ({
                                    ...item, // Retain all existing properties of the object
                                    isEditable: false, // Add a new property `isEditable` with a default value of `false`
                                    DueDate: item.DueDate ? new Date(item.DueDate).toISOString().slice(0, 10) : null
                                }))
                            };
                            this.int_row = oData.results ? oData.results.length : 0;
                            var oTaskModel = new sap.ui.model.json.JSONModel(oTaskData); // Use `oData.results` for OData lists
                            this.getView().setModel(oTaskModel, "taskModel");
                            console.log(this.getView().getModel("taskModel"))
                        }.bind(this),
                        error: function (oError) {
                            console.error(oError);  // Handle error
                        }
                    });
                } else {
                    console.error("OData model not found.");
                }
            },
            set_save_button_status: function(){
                var oModel = this.getView().getModel("taskModel");
                var bCurrentStatus = oModel.getProperty("/save_button_status");
                // Set the opposite value
                oModel.setProperty("/save_button_status", !bCurrentStatus);
                
            },
            set_edit_button_status: function(){
                var oModel = this.getView().getModel("taskModel");
                var bCurrentStatus = oModel.getProperty("/edit_button_status");
                // Set the opposite value
                oModel.setProperty("/edit_button_status", !bCurrentStatus);
            },
            set_add_button_status: function(){
                var oModel = this.getView().getModel("taskModel");
                var bCurrentStatus = oModel.getProperty("/add_button_status");
                // Set the opposite value
                oModel.setProperty("/add_button_status", !bCurrentStatus);
            },
            onCancel: function() {
                this.status_add = false;
                this.aSelectedData = null;
                this.refresh_model();
                // this.getView().setModel(oModel, "taskModel");
                MessageToast.show("Cancel is working");
            },

            // value help fragement implementation
            onValueHelpRequested_Id: function (oEvent) {
                var oSource = oEvent.getSource();
                var oBindingContext = oSource.getBindingContext("taskModel");
                this._iSelectedRowIndex = oBindingContext.getPath().split("/").pop();
                if (!this.oWhitespaceDialog) {
                    // Load the fragment using sap.ui.xmlfragment
                    this.oWhitespaceDialog = sap.ui.xmlfragment(
                        "customer.task.variant.changes.fragments.personid_vh", // Path to the fragment
                        this // Controller reference
                    );
            
                    // Add the dialog as a dependent
                    this.getView().addDependent(this.oWhitespaceDialog);
            
                }
            
                // Open the dialog
                this.oWhitespaceDialog.open();
            },
            handleSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                // var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
                var oFilter = new sap.ui.model.Filter("BusinessPartnerName", sap.ui.model.FilterOperator.Contains, sValue);
                var oBinding = oEvent.getSource().getBinding("items");
                // oBinding.filter([oFilter]);
                // var aFilter = new sap.ui.model.Filter({
                //     filters: oFilter,
                //     and: true // Use 'true' for AND, 'false' for OR
                // });
                oBinding.filter([oFilter]);
            },
            handleValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem").getBindingContext("taskModel1").getObject();
                var oTaskModel = this.getView().getModel("taskModel");
                var sRowPath = "/results/" + this._iSelectedRowIndex; // Build the path for the specific row
                oTaskModel.setProperty(sRowPath + "/AddpersonID", oSelectedItem.BusinessPartner);
                oTaskModel.setProperty(sRowPath + "/PersonName", oSelectedItem.BusinessPartnerName);
                
                // oInput.setValue(oSelectedItem.getCells()[0].getTitle());
            },
            

        });
    }
);
