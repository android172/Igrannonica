import json

# CRUD operation #
            
def add_row(self):
    # Receive row values
    row_string = self.connection.receive()
    new_row = json.loads(row_string)["Data"]
    
    if len(new_row) != self.network.data.get_column_count():
        self.report_error(f"ERROR :: Wrong number of inputs given; " +
                            f"Namely {len(new_row)} instead of {self.network.data.get_column_count()}.")
        return
    
    return_code = self.network.data.add_row(new_row)
    if return_code >= 0:
        self.report_error(f"ERROR :: Invalid type for column {return_code} given.")
        return
    
    self.connection.send("OK")
    print(f"Row: {new_row} added to the dataset.")

def add_row_to_test(self):
    # Receive row values
    row_string = self.connection.receive()
    new_row = json.loads(row_string)["Data"]
    
    if len(new_row) != self.network.data.get_column_count():
        self.report_error(f"ERROR :: Wrong number of inputs given; " +
                            f"Namely {len(new_row)} instead of {self.network.data.get_column_count()}.")
        return
    
    return_code = self.network.data.add_row(new_row, True)
    if return_code >= 0:
        self.report_error(f"ERROR :: Invalid type for column {return_code} given.")
        return
    
    self.connection.send("OK")
    print(f"Row: {new_row} added to the test dataset.")
    
def update_row(self):
    # Receive row index
    row_index = int(self.connection.receive())
    # Receive row values
    row_string = self.connection.receive()
    new_row = json.loads(row_string)["Data"]
    
    if len(new_row) != self.network.data.get_column_count():
        self.report_error(f"ERROR :: Wrong number of inputs given; " +
                            f"Namely {len(new_row)} instead of {self.network.data.get_column_count()}.")
        return
    
    return_code = self.network.data.update_row(row_index, new_row)
    if return_code >= 0:
        self.report_error(f"ERROR :: Invalid type for column {return_code} given.")
        return
    if return_code == -2:
        self.report_error(f"ERROR :: Row with index {row_index} doesn't exist.")
        return
    
    self.connection.send("OK")
    print(f"Row {row_index} replaced with values: {new_row}.")
    
def delete_rows(self):
    # Receive row index
    row_string = self.connection.receive()
    rows = []
    if row_string != '':
        rows = [int(x) for x in row_string.split(":")]
    deleted = self.network.data.remove_rows(rows)
    if not deleted:
        self.report_error("ERROR :: Row doesn't exist.")
        return
    
    self.connection.send("OK")
    print(f"Rows {rows} removed from the dataset.")
    
def add_column(self):
    # Receive column values
    column_string = self.connection.receive()
    new_column = json.loads(column_string)["Data"]
    # Receive column name
    column_name = self.connection.receive()
    self.network.data.add_column(new_column, column_name)
    
    print(f"Column: {new_column} added to the dataset.")
    
def update_column(self):
    # Receive column index
    column_index = int(self.connection.receive())
    # Receive column values
    column_string = self.connection.receive()
    new_column = json.loads(column_string)["Data"]
    self.network.data.update_column(column_index, new_column, None)
    
    print(f"Column {column_index} replaced with values: {new_column}.")
    
def rename_column(self):
    # Receive column index
    column_index = int(self.connection.receive())
    # Receive column name
    column_name = self.connection.receive()
    self.network.data.update_column(column_index, None, column_name)
    
    print(f"Column {column_index} renamed from {self.network.data.dataset.columns[column_index]} to {column_name}.")
    
def update_and_rename_column(self):
    # Receive column index
    column_index = int(self.connection.receive())
    # Receive column values
    column_string = self.connection.receive()
    new_column = json.loads(column_string)["Data"]
    # Receive column name
    column_name = self.connection.receive()
    self.network.data.update_column(column_index, new_column, column_name)
    
    print(f"Column {column_index} replaced with values: {new_column}.")
    print(f"Column {column_index} renamed from {self.network.data.dataset.columns[column_index]} to {column_name}.")
    
def delete_columns(self):
    # Receive column index
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    self.network.data.remove_columns(columns)
    
    self.connection.send("OK")
    print(f"Columns {columns} removed from the dataset.")
    
def update_value(self):
    # Receive row
    row = int(self.connection.receive())
    # Receive column
    column = int(self.connection.receive())
    # Receive value
    value = self.connection.receive()
    
    return_code = self.network.data.update_field(row, column, value)
    if return_code > 0:
        if return_code == 1:
            self.report_error(f"ERROR :: Row with index {row} doesn't exist.")
        elif return_code == 2:
            self.report_error(f"ERROR :: Column with index {column} doesn't exist.")
        else:
            self.report_error("ERROR :: Value given is of the invalid type.")
        return
    
    self.connection.send("OK")
    print(f"Field ({row}, {column}) updated to {value}.")
    
# NA values #
def empty_string_to_na(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    self.network.data.replace_value_with_na(columns, '')
    
    self.connection.send("OK")
    print(f"Empty strings from columns {columns} replaced with NA.")

def zero_to_na(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    self.network.data.replace_value_with_na(columns, 0)
    
    self.connection.send("OK")
    print(f"Zero values from columns {columns} replaced with NA.")

def drop_na_listwise(self):
    self.network.data.drop_na_listwise()
    
    print("All rows with any NA values dropped from dataset.")

def drop_na_pairwise(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    self.network.data.drop_na_pairwise(columns)
    
    self.connection.send("OK")
    print("All selected rows with any NA values dropped from dataset.")

def drop_na_columns(self):
    self.network.data.drop_na_columns()
    
    print("All columns with any NA values dropped from dataset.")
    
def fill_na_with_value(self):
    # Receive columns
    column = int(self.connection.receive())
    if not self.network.data.columns_are_valid([column]):
        self.report_error("ERROR :: Illegal output column given.")
        return
    
    # Receive value
    value = self.connection.receive()
    
    if not self.network.data.replace_na_with_value(column, value):
        self.report_error("ERROR :: NA column is numerical, but categorical value was given.")
        return
    
    self.connection.send("OK")
    print(f"NA values in column {column} replaced with {value}.")
    
def fill_na_with_mean(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    if not self.network.data.replace_na_with_mean(columns):
        self.report_error("ERROR :: Only numerical columns can be used.")
        return
    
    self.connection.send("OK")
    print(f"NA values in columns {columns} replaced using mean value.")

def fill_na_with_median(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    if not self.network.data.replace_na_with_median(columns):
        self.report_error("ERROR :: Only numerical columns can be used.")
        return
    
    self.connection.send("OK")
    print(f"NA values in columns {columns} replaced using median value.")

def fill_na_with_mode(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    self.network.data.replace_na_with_mode(columns)
    
    self.connection.send("OK")
    print(f"NA values in columns {columns} replaced using mode value.")

def fill_na_with_regression(self):
    # Receive column with NA values
    column = int(self.connection.receive())
    # Receive columns for regression
    columns_string = self.connection.receive()
    input_columns = self.parse_columns(columns_string)
    if input_columns is None: return
    
    if not self.network.data.columns_are_valid([column]):
        self.report_error("ERROR :: Illegal output column given.")
        return
    
    if not self.network.data.replace_na_with_regression(column, input_columns):
        self.report_error("ERROR :: Only numerical variables can be used for input and output.")
        return
    
    self.connection.send("OK")
    print(f"NA values from column {column} replaced using a model fit on columns {input_columns}.")
    
# Encoding #
def label_encoding(self):
    # Receive columns to encode
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    if not self.network.data.label_encode_columns(columns):
        self.report_error("ERROR :: Only non float columns can be encoded.")
        return
    
    self.connection.send("OK")
    print(f"Columns {columns} were label encoded.")

def one_hot_encoding(self):
    # Receive columns to encode
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    result = self.network.data.one_hot_encode_columns(columns)
    if   result == 1:
        self.report_error("ERROR :: Only non float columns can be encoded.")
        return
    elif result == 2:
        self.report_error("ERROR :: Too many categories for one-hot encoding to handle.")
        return
    
    self.connection.send("OK")
    print(f"Columns {columns} were one-hot encoded.")

# Data manipulation : Normalization #
def scale_absolute_max(self):
    # Receive columns to scale
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    return_code = self.network.data.maximum_absolute_scaling(columns)
    if return_code >= 0:
        self.report_error(f"ERROR :: Column {return_code} is not numerical.")
        return
    
    self.connection.send("OK")
    print(f"Columns {columns} were maximum absolute scaled.")
    
def scale_min_max(self):
    # Receive columns to scale
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    return_code = self.network.data.min_max_scaling(columns)
    if return_code >= 0:
        self.report_error(f"ERROR :: Column {return_code} is not numerical.")
        return
    
    self.connection.send("OK")
    print(f"Columns {columns} were min-max scaled.")
    
def scale_z_score(self):
    # Receive columns to scale
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    return_code = self.network.data.z_score_scaling(columns)
    if return_code >= 0:
        self.report_error(f"ERROR :: Column {return_code} is not numerical.")
        return
    
    self.connection.send("OK")
    print(f"Columns {columns} were z-score scaled.")
    
# Outliers #
def remove_outliers_standard_deviation(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Receive threshold
    threshold = float(self.connection.receive())
    
    if threshold < 0:
        self.report_error("ERROR :: Threshold must be positive.")
        return
    
    if not self.network.data.standard_deviation_outlier_removal(columns, threshold):
        self.report_error("ERROR :: Method can only be applied to numerical variables.")
        return
    
    self.connection.send("OK")
    print(f'Outliers removed from columns {columns} using standard deviation method.')

def remove_outliers_quantiles(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Receive threshold
    threshold = float(self.connection.receive())
    
    if threshold < 0 or threshold > 1:
        self.report_error("ERROR :: Threshold must be positive value smaller then one.")
        return
    
    if not self.network.data.quantile_outlier_removal(columns, threshold):
        self.report_error("ERROR :: Method can only be applied to numerical variables.")
        return
    
    self.connection.send("OK")
    print(f'Outliers removed from columns {columns} using quantiles method.')

def remove_outliers_z_score(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    # Receive threshold
    threshold = float(self.connection.receive())
    
    if threshold < 0:
        self.report_error("ERROR :: Threshold must be positive.")
        return
    
    if not self.network.data.z_score_outlier_removal(columns, threshold):
        self.report_error("ERROR :: Method can only be applied to numerical variables.")
        return
    
    self.connection.send("OK")
    print(f'Outliers removed from columns {columns} using z-score method.')

def remove_outliers_iqr(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    if not self.network.data.iqr_outlier_removal(columns):
        self.report_error("ERROR :: Method can only be applied to numerical variables.")
        return
    
    self.connection.send("OK")
    print(f'Outliers removed from columns {columns} using inter-quantile range method.')

def remove_outliers_isolation_forest(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    if not self.network.data.isolation_forest_outlier_removal(columns):
        self.report_error("ERROR :: Method can only be applied to numerical variables.")
        return
    
    self.connection.send("OK")
    print(f'Outliers removed from columns {columns} using isolation forest method.')

def remove_outliers_one_class_svm(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    if not self.network.data.one_class_svm_outlier_removal(columns):
        self.report_error("ERROR :: Method can only be applied to numerical variables.")
        return
    
    self.connection.send("OK")
    print(f'Outliers removed from columns {columns} using one class svm method.')
    
def remove_outliers_by_local_factor(self):
    # Receive columns
    columns_string = self.connection.receive()
    columns = self.parse_columns(columns_string)
    if columns is None: return
    
    if not self.network.data.local_outlier_factor_outlier_removal(columns):
        self.report_error("ERROR :: Method can only be applied to numerical variables.")
        return
    
    self.connection.send("OK")
    print(f'Outliers removed from columns {columns} using local outlier factor method.')
