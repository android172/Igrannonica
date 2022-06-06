import random
from collections import deque

import pandas as pd
import numpy as np
from torch import tensor
import matplotlib.pyplot as plt

from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import OrdinalEncoder
from sklearn.linear_model import LinearRegression
from sklearn.svm import OneClassSVM
from scipy import stats

from Models.StatisticsCategorical import StatisticsCategorical
from Models.StatisticsNumerical import StatisticsNumerical
from Utils import CustomColors

class MLData:
    
    def __init__(self) -> None:
        self.dataset        = None
        self.column_types   = None
        self.column_data_ty = None
        
        self.input_columns  = []
        self.output_columns = []
        
        self.test_col = '_IsATestPoint'
        
        self.past_states = deque(maxlen=5)
        self.future_states = deque(maxlen=5)
        
        self.dataset_versions = {}
        
    def create_deep_copy(self, version):
        data = MLData()
        
        if version is None:
            data.dataset = self.dataset.copy(deep=True)
        else:
            data.dataset = self.dataset_versions[version].copy(deep=True)
        
        data.column_types   = [x for x in self.column_types]
        data.column_data_ty = [x for x in self.column_data_ty]
        data.input_columns  = [x for x in self.input_columns]
        data.output_columns = [x for x in self.output_columns]
        return data
    
    # Load dataset
    def load_from_csv(self, pathOrBuffer):
        dataset = pd.read_csv(pathOrBuffer, sep=None, engine='python')
        self._load_dataset(dataset)
    
    def load_from_json(self, pathOrBuffer):
        dataset = pd.read_json(pathOrBuffer)
        self._load_dataset(dataset)
    
    def load_from_excel(self, pathOrBuffer):
        dataset = pd.read_excel(pathOrBuffer)
        self._load_dataset(dataset)
    
    def _load_dataset(self, dataset):
        self.clear_change_history()
        
        self.dataset = dataset
        
        if self.test_col not in self.dataset.columns:
            series = pd.Series([0 for _ in range(self.dataset.shape[0])], name=self.test_col)
            self.dataset = self.dataset.join(series)
        
        self.input_columns = []
        self.output_columns = []
        
        self.column_types = [str(x) for x in self.dataset.dtypes]
        
        self.column_data_ty = []
        for type in self.column_types:
            self.column_data_ty.append('Numerical' if (type == 'int64' or type == 'float64') else 'Categorical')
    
    def load_test_from_csv(self, pathOrBuffer):
        dataset_test = pd.read_csv(pathOrBuffer, sep=None, engine='python')
        self._load_test_dataset(dataset_test)
    
    def load_test_from_json(self, pathOrBuffer):
        dataset_test = pd.read_json(pathOrBuffer)
        self._load_test_dataset(dataset_test)
        
    def load_test_from_excel(self, pathOrBuffer):
        dataset_test = pd.read_excel(pathOrBuffer)
        self._load_test_dataset(dataset_test)
        
    def _load_test_dataset(self, dataset_test):
        self.save_change()
        
        series = pd.Series([1 for _ in range(dataset_test.shape[0])], name=self.test_col)
        dataset_test = dataset_test.join(series)
        
        self.dataset = pd.concat([self.dataset, dataset_test])
        
    # Save changes
    def save_to_csv(self, path):
        self.dataset.to_csv(path, index=False)
    
    def save_to_json(self, path):
        self.dataset.to_json(path, index=False)
        
    def save_to_excel(self, path):
        self.dataset.to_excel(path, index=False)
        
    # Manage versions
    def save_change(self):
        self.past_states.append({
            'dataset'       : self.dataset.copy(deep=True),
            'column_types'  : [x for x in self.column_types],
            'column_data_ty': [x for x in self.column_data_ty],
            'input_columns' : [x for x in self.input_columns],
            'output_columns': [x for x in self.output_columns]
        })
        self.future_states.clear()
    
    def undo_change(self):
        if len(self.past_states) == 0:
            return False
        self.future_states.append({
            'dataset'       : self.dataset,
            'column_types'  : self.column_types,
            'column_data_ty': self.column_data_ty,
            'input_columns' : self.input_columns,
            'output_columns': self.output_columns
        })
        past_state = self.past_states.pop()
        self.dataset        = past_state['dataset']
        self.column_types   = past_state['column_types']
        self.column_data_ty = past_state['column_data_ty']
        self.input_columns  = past_state['input_columns']
        self.output_columns = past_state['output_columns']
        return True
    
    def redo_change(self):
        if len(self.future_states) == 0:
            return False
        self.past_states.append({
            'dataset'       : self.dataset,
            'column_types'  : self.column_types,
            'column_data_ty': self.column_data_ty,
            'input_columns' : self.input_columns,
            'output_columns': self.output_columns
        })
        future_state = self.future_states.pop()
        self.dataset        = future_state['dataset']
        self.column_types   = future_state['column_types']
        self.column_data_ty = future_state['column_data_ty']
        self.input_columns  = future_state['input_columns']
        self.output_columns = future_state['output_columns']
        return True
    
    def clear_change_history(self):
        self.past_states.clear()
        self.future_states.clear()
        
    def contains_dataset_version(self, versionName):
        dataset_version = self.dataset_versions.get(versionName, None)
        if dataset_version is None:
            return False
        return True
        
    def load_dataset_version(self, versionName):
        dataset_version = self.dataset_versions.get(versionName, None)
        if dataset_version is None:
            return False
        self._load_dataset(dataset_version.copy(deep=True))
        return True

    def save_dataset_version(self, versionName):
        self.dataset_versions[versionName] = self.dataset.copy(deep=True)
        
    # Select columns
    def select_input_columns(self, columns, version = None):
        data_types = self.dataset.dtypes if version is None else self.dataset_versions[version].dtypes
        column_types = [str(i) for i in data_types]
        for ci in columns:
            if column_types[ci] != 'int64' and column_types[ci] != 'float64':
                return False
        self.input_columns = columns
        return True
    
    def select_output_columns(self, columns, version = None):
        data_types = self.dataset.dtypes if version is None else self.dataset_versions[version].dtypes
        column_types = [str(i) for i in data_types]
        for ci in columns:
            if column_types[ci] != 'int64' and column_types[ci] != 'float64':
                return False
        self.output_columns = columns
        return True
    
    # Train test splits
    def random_train_test_split(self, ratio):
        self.save_change()
        
        dataset_length = self.dataset.shape[0]
        split_point = int(dataset_length * (1.0 - ratio))
        
        # Initialize index lists
        index_list = [i for i in range(dataset_length)]
        random.shuffle(index_list)
        train_indices = index_list[:split_point]
        test_indices  = index_list[split_point:]
        
        self.dataset.loc[train_indices, self.test_col] = 0
        self.dataset.loc[test_indices,  self.test_col] = 1

    # ########### #
    # Data access #
    # ########### #
    
    def columns_are_valid(self, columns, version = None):
        length = self.dataset.shape[1] if version is None else self.dataset_versions[version].shape[1]
        length -= 1 # Remove test column
        for column in columns:
            if column < 0 or column >= length:
                return False
        return True
    
    def get_train_count(self):
        return (self.dataset[self.test_col] == 0).sum()
    
    def get_test_count(self):
        return (self.dataset[self.test_col] == 1).sum()
    
    def get_train_dataset(self):
        train_data = []
        for row in self.dataset[self.dataset[self.test_col] == 0].values:
            x = tensor(row[self.input_columns].astype('float64')).float()
            y = tensor(row[self.output_columns].astype('float64')).float()
            train_data.append((x, y))
        return train_data
    
    def get_test_dataset(self):
        test_data = []
        for row in self.dataset[self.dataset[self.test_col] == 1].values:
            x = tensor(row[self.input_columns].astype('float64')).float()
            y = tensor(row[self.output_columns].astype('float64')).float()
            test_data.append((x, y))
        return test_data
    
    def get_rows(self, rows):
        return self.dataset.iloc[rows, :-1]
    
    def get_columns(self, version):
        dataset = self.dataset_versions.get(version, None)
        if dataset is not None:
            return [x for x in dataset.columns[:-1]]
        return None
    
    def get_row_count(self):
        return self.dataset.shape[0]

    def get_column_count(self):
        return self.dataset.shape[1] - 1
    
    def get_column_types(self):
        return self.column_data_ty[:-1]
    
    def get_column_numerical(self):
        return [str(t) in ['int64', 'float64'] for t in self.dataset.dtypes[: -1]]
    
    # ################# #
    # Data manipulation #
    # ################# #
    
    # Edit dataset
    def update_field(self, row, column, value):
        if row < 0 or row > self.dataset.shape[0]:
            return 1
        if column < 0 or column > self.dataset.shape[1]:
            return 2

        try:
            if self.column_types[column] == 'int64':
                value = int(value)
            elif self.column_types[column] == 'float64':
                value = float(value)
        except:
            return 3
        
        self.save_change()
        self.dataset.iloc[row, column] = value
        return 0

    def add_row(self, new_row, test=False):
        # Convert row values to proper types
        new_row.append(0 if test==False else 1)
        series = pd.Series(new_row, index=self.dataset.columns)
        for i in range(len(new_row)):
            try:
                if self.column_types[i] == 'int64':
                    series[i] = int(series[i])
                elif self.column_types[i] == 'float64':
                    series[i] = float(series[i])
            except:
                return i
            
        # import values
        self.save_change()
        self.dataset.loc[self.dataset.shape[0]] = series
        return -1
    
    def update_row(self, row, new_row):
        if row < 0 or row >= self.dataset.shape[0]:
            return -2
        new_row.append(self.dataset.loc[row, self.test_col])
        # Convert row values to proper types
        series = pd.Series(new_row, index=self.dataset.columns)
        for i in range(len(new_row)):
            try:
                if self.column_types[i] == 'int64':
                    series[i] = int(series[i])
                elif self.column_types[i] == 'float64':
                    series[i] = float(series[i])
            except:
                return i
        self.save_change()
        # Replace values
        self.dataset.iloc[row] = series
        return -1
            
    def remove_rows(self, rows):
        for row in rows:
            if row < 0 or row >= self.dataset.shape[0]:
                return False
            
        self.save_change()
        self.dataset.drop(self.dataset.index[rows], inplace=True)
        return True
            
    def add_column(self, new_column, label):
        self.save_change()
        
        series = pd.Series(new_column)
        self.dataset = self.dataset.insert(self.dataset.shape[1] - 1, label, series)
        
        new_column_type = series.dtype
        self.column_types.insert(-1, new_column_type)
        self.column_data_ty.insert(-1, 'Numerical' if (type == 'int64' or type == 'float64') else 'Categorical')
    
    def update_column(self, column, new_column=None, new_label=None):
        self.save_change()
        
        if new_label is not None:
            self.dataset.rename(columns={self.dataset.columns[column]:new_label}, inplace=True)
        if new_column is not None:
            self.dataset.iloc[:, column] = new_column
            
        new_column_type = self.dataset.dtypes[column]
        self.column_types[column] = new_column_type
        self.column_data_ty[column] = 'Numerical' if (type == 'int64' or type == 'float64') else 'Categorical'
        
    def remove_columns(self, columns):
        self.save_change()
        self.dataset.drop(self.dataset.columns[columns], axis=1, inplace=True)
        columns.sort(reverse=True)
        for col in columns:
            self.column_types.pop(col)
            self.column_data_ty.pop(col)
            self.input_columns  = [j - 1 if j > col else j for j in self.input_columns  if j != col]
            self.output_columns = [j - 1 if j > col else j for j in self.output_columns if j != col]
            
    # Handeling NA values
    def replace_value_with_na(self, columns, value):
        self.save_change()
        self.dataset.iloc[:, columns] = self.dataset.iloc[:, columns].replace(value, pd.NA)
    
    def drop_na_listwise(self):
        self.save_change()
        self.dataset.dropna(inplace=True)
    
    def drop_na_columns(self):
        self.save_change()
        old_cols = self.dataset.columns.tolist()
        self.dataset.dropna(axis=1, inplace=True)
        
        deleted_cols = [i for i, col in enumerate(old_cols) if col not in self.dataset.columns.tolist()]
        deleted_cols.reverse
        
        for col in deleted_cols:
            self.column_types.pop(col)
            self.column_data_ty.pop(col)
            self.input_columns  = [j - 1 if j > col else j for j in self.input_columns  if j != col]
            self.output_columns = [j - 1 if j > col else j for j in self.output_columns if j != col]

    def drop_na_pairwise(self, columns):
        self.save_change()
        subset = self.dataset.columns[columns]
        self.dataset.dropna(subset=subset, inplace=True)
        
    # NA imputing
    def replace_na_with_value(self, column, value):
        column_type = self.column_types[column]
        try:
            if column_type == 'int64':
                value = int(value)
            elif column_type == 'float64':
                value = float(value)
        except:
            return False
        
        self.save_change()
        self.dataset.iloc[:, column].fillna(value, inplace=True)
        
        if column_type == 'int64':
            self.dataset.iloc[:, column] = self.dataset.iloc[:, column].astype('int64')
        elif column_type == 'float64':
            self.dataset.iloc[:, column] = self.dataset.iloc[:, column].astype('float64')
        return True
    
    def replace_na_with_mean(self, columns):
        try: means = self.dataset.iloc[:, columns].replace(pd.NA, np.nan).astype('float64').mean()
        except: return False
        self.save_change()
        self.dataset.fillna(means, inplace=True)
        self.dataset.iloc[:, columns] = self.dataset.iloc[:, columns].astype('float64')
        return True
    
    def replace_na_with_median(self, columns):
        try: medians = self.dataset.iloc[:, columns].replace(pd.NA, np.nan).astype('float64').median()
        except: return False
        self.save_change()
        self.dataset.fillna(medians, inplace=True)
        for i in columns:
            if self.column_types[i] == 'int64':
                self.dataset.iloc[:, i] = self.dataset.iloc[:, i].astype('int64')
            elif self.column_types[i] == 'float64':
                self.dataset.iloc[:, i] = self.dataset.iloc[:, i].astype('float64')
        return True
    
    def replace_na_with_mode(self, columns):
        self.save_change()
        modes = self.dataset.iloc[:, columns].astype(str).replace("<NA>", pd.NA).mode().iloc[0]
        self.dataset.fillna(modes, inplace=True)
        for i in columns:
            if self.column_types[i] == 'int64':
                self.dataset.iloc[:, i] = self.dataset.iloc[:, i].astype('int64')
            elif self.column_types[i] == 'float64':
                self.dataset.iloc[:, i] = self.dataset.iloc[:, i].astype('float64')
        
    def replace_na_with_regression(self, column, input_columns):
        if self.dataset.iloc[:, input_columns].isna().any().any() == True:
            return False
        
        na_rows = self.dataset.iloc[:, column].isna()
        
        if na_rows.sum() == 0:
            return True
        
        not_na_rows = [not x for x in na_rows]
        try: 
            inputs = self.dataset[not_na_rows].iloc[:, input_columns].astype('float64')
            output = self.dataset[not_na_rows].iloc[:, column].astype('float64')
        except: return False
        
        self.save_change()
        
        regression = LinearRegression().fit(inputs, output)
        predictions = regression.predict(self.dataset[na_rows].iloc[:, input_columns])
        self.dataset.loc[na_rows, self.dataset.columns[column]] = predictions
        
        if self.column_types[column] == 'int64':
            self.dataset.iloc[:, column] = self.dataset.iloc[:, column].astype('int64')
        elif self.column_types[column] == 'float64':
            self.dataset.iloc[:, column] = self.dataset.iloc[:, column].astype('float64')
        return True
        
    # Value encoding
    def label_encode_columns(self, columns):
        for column in columns:
            if self.column_types[column] == 'float64':
                return False
        
        self.save_change()
        
        self.dataset.iloc[:, columns] = OrdinalEncoder().fit_transform(self.dataset.iloc[:, columns]).astype('int64')
        for column in columns:
            self.column_types[column] = 'int64'
            
        return True
    
    def one_hot_encode_columns(self, columns):
        for column in columns:
            if self.column_types[column] == 'float64':
                return 1
            if self.dataset.iloc[:, column].nunique() > 64:
                return 2
            
        self.save_change()
        
        last_col_i = self.dataset.shape[1] - 1
        
        encoder = OneHotEncoder()
        result = encoder.fit_transform(self.dataset.iloc[:, columns]).astype('int64').toarray()
        new_columns = [self.dataset.columns[columns[i]] + str(group) 
                    for i in range(len(columns)) for group in encoder.categories_[i]]
        self.dataset.drop(self.dataset.columns[columns], axis=1, inplace=True)
        self.dataset[new_columns] = result
        self.dataset = self.dataset[[col for col in self.dataset if col != self.test_col] + [self.test_col]]
        
        old_columns = [(i, x) for i,x in enumerate(columns)]
        old_columns.sort(reverse=True)
        for i, col in old_columns:
            self.column_types.pop(col)
            self.column_data_ty.pop(col)
            
            # Sortout input and output columns
            no_new_columns = len(encoder.categories_[i])
            
            if col in self.input_columns:
                self.input_columns.extend([j for j in range(last_col_i, last_col_i + no_new_columns)])
            if col in self.output_columns:
                self.output_columns.extend([j for j in range(last_col_i, last_col_i + no_new_columns)])
                
            self.input_columns  = [j - 1 if j > col else j for j in self.input_columns  if j != col]
            self.output_columns = [j - 1 if j > col else j for j in self.output_columns if j != col]
            
            last_col_i += no_new_columns - 1
            
        for col in new_columns:
            self.column_types.insert(-1, 'int64')
            self.column_data_ty.insert(-1, 'Categorical')
        return 0
    
    # Normalization
    def maximum_absolute_scaling(self, columns):
        scaled_values = {}
        for ci in columns:
            column = self.dataset.iloc[:, ci]
            try: scaled_values[ci] = column / column.abs().max()
            except: return ci
        
        self.save_change()
        for ci, values in scaled_values.items():
            self.dataset.iloc[:, ci] = values
        
        for col in columns:
            self.column_types[col] = 'float64'
            self.column_data_ty[col] = 'Numerical'
        return -1
    
    def min_max_scaling(self, columns):
        scaled_values = {}
        for ci in columns:
            column = self.dataset.iloc[:, ci]
            try: scaled_values[ci] = (column - column.min()) / (column.max() - column.min())
            except: return ci
        
        self.save_change()
        for ci, values in scaled_values.items():
            self.dataset.iloc[:, ci] = values
        
        for col in columns:
            self.column_types[col] = 'float64'
            self.column_data_ty[col] = 'Numerical'
        return -1
    
    def z_score_scaling(self, columns):
        scaled_values = {}
        for ci in columns:
            column = self.dataset.iloc[:, ci]
            try: scaled_values[ci] = (column - column.mean()) / column.std()
            except: return ci
        
        self.save_change()
        for ci, values in scaled_values.items():
            self.dataset.iloc[:, ci] = values
        
        for col in columns:
            self.column_types[col] = 'float64'
            self.column_data_ty[col] = 'Numerical'
        return -1
        
    # Outlier detection    
    def standard_deviation_outlier_removal(self, columns, treshold):
        try: sub_df = self.dataset.iloc[:, columns].astype('float64')
        except: return False
        self.save_change()
        self.dataset = self.dataset[(np.abs(sub_df - sub_df.mean()) < treshold * sub_df.std()).all(axis=1)]
        return True
    
    def quantile_outlier_removal(self, columns, treshold):
        try: sub_df = self.dataset.iloc[:, columns].astype('float64')
        except: return False
        self.save_change()
        self.dataset = self.dataset[((sub_df > sub_df.quantile(treshold)) & (sub_df < sub_df.quantile(1 - treshold))).all(axis=1)]
        return True
    
    def z_score_outlier_removal(self, columns, treshold):
        try: sub_df = self.dataset.iloc[:, columns].astype('float64')
        except: return False
        self.save_change()
        self.dataset = self.dataset[(np.abs(stats.zscore(sub_df)) < treshold).all(axis=1)]
        return True
        
    def iqr_outlier_removal(self, columns):
        try: sub_df = self.dataset.iloc[:, columns].astype('float64')
        except: return False
        
        self.save_change()
        q1 = sub_df.quantile(0.25)
        q3 = sub_df.quantile(0.75)
        iqr = 1.5 * (q3 - q1)
        self.dataset = self.dataset[((sub_df > q1 - iqr) & (sub_df < q3 + iqr)).all(axis=1)]
        return True
    
    def isolation_forest_outlier_removal(self, columns):
        try: rows = IsolationForest().fit_predict(self.dataset.iloc[:, columns])
        except: return False
        self.save_change()
        self.dataset = self.dataset[np.where(rows == 1, True, False)]
        return True
        
    def one_class_svm_outlier_removal(self, columns):
        try: rows = OneClassSVM().fit_predict(self.dataset.iloc[:, columns])
        except: return False
        self.save_change()
        self.dataset = self.dataset[np.where(rows == 1, True, False)]
        return True
    
    def local_outlier_factor_outlier_removal(self, columns):
        try: rows = LocalOutlierFactor().fit_predict(self.dataset.iloc[:, columns])
        except: return False
        self.save_change()
        self.dataset = self.dataset[np.where(rows == 1, True, False)]
        return True
            
    # ######## #
    # Analysis #
    # ######## #
    # Toggle Numerical/Categorical
    def toggle_column_data_type(self, column):
        if self.column_data_ty[column] == 'Numerical':
            if self.dataset.dtypes[column] == 'float64':
                return False
            self.column_data_ty[column] = 'Categorical'
        else:
            if self.dataset.dtypes[column] not in ['int64', 'float64']:
                return False
            self.column_data_ty[column] = 'Numerical'
        
        return True
    
    # Column statistics
    def get_numerical_statistics(self, columns):
        column_names = self.dataset.columns[columns]
        
        try: description = self.dataset[column_names].replace(pd.NA, np.nan).astype('float64').describe()
        except: return None
        na_counts = self.dataset[column_names].isna().sum()
        total_count = self.dataset.shape[0]
        valid_counts = total_count - na_counts
        unique_counts = self.dataset[column_names].nunique()
        
        statistics = {}
        for column in column_names:
            statistics[column] = StatisticsNumerical(
                valid_count   = valid_counts[column],
                na_count      = na_counts[column],
                unique_count  = unique_counts[column],
                mean          = description[column]['mean'],
                std_deviation = description[column]['std'],
                median        = description[column]['50%'],
                quantiles_25  = description[column]['25%'],
                quantiles_50  = description[column]['50%'],
                quantiles_75  = description[column]['75%'],
                min           = description[column]['min'],
                max           = description[column]['max']
                ).__dict__
            
        return statistics
    
    def get_categorical_statistics(self, columns):
        column_names = self.dataset.columns[columns]
        
        total_count = self.dataset.shape[0]
        na_counts = self.dataset[column_names].isna().sum()
        valid_counts = total_count - na_counts
        unique_counts = self.dataset[column_names].nunique()
        
        statistics = {}
        for column in column_names:
            frequencies = [(k, v) for k, v in self.dataset[column].value_counts(normalize=True, sort=True).items()]
            most_common = frequencies[0]
            
            five_most_frequent = []
            if (len(frequencies) < 6):
                five_most_frequent = [f for f in frequencies]
            else:
                total_left = 1.0
                for i in range(4):
                    five_most_frequent.append(frequencies[i])
                    total_left -= frequencies[i][1]
                five_most_frequent.append(('Other', total_left))
            
            statistics[column] = StatisticsCategorical(
                valid_count  = valid_counts[column],
                na_count     = na_counts[column],
                unique_count = unique_counts[column],
                most_common  = most_common,
                frequencies  = five_most_frequent
            ).__dict__
    
        return statistics
    
    # ################## #
    # Data Visualization #
    # ################## #
    
    def _change_style(self, ax, transparent_axis=False, full_box=False):
        ax.set_facecolor(CustomColors.transparent)
        
        top_right_color = CustomColors.transparent
        if full_box:
            top_right_color = 'white'
        
        ax.spines['bottom'].set_color('white')
        ax.spines['top'].set_color(top_right_color) 
        ax.spines['right'].set_color(top_right_color)
        ax.spines['left'].set_color('white')
        
        if transparent_axis:
            ax.tick_params(
                left=False,
                    bottom=False,
                    labelleft=False,
                    labelbottom=False
            )
        else:
            ax.tick_params(axis='x', colors='white')
            ax.tick_params(axis='y', colors='white')
        
        ax.yaxis.label.set_color('white')
        ax.xaxis.label.set_color('white')
        
    def _save_fig(self, ax, path):
        fig = ax.get_figure()
        fig.savefig(path, dpi=150, bbox_inches = 'tight', transparent=True)
    
    def _generate_colors(self, n):
        initial_r = int(CustomColors.accent[1:3], 16)
        initial_g = int(CustomColors.accent[3:5], 16)
        initial_b = int(CustomColors.accent[5:7], 16)
        
        step_r = 250 // n
        step_g = 20 // n
        step_b = 40 // n
        
        colors = []
        for i in range(0, n):
            r = initial_r - i * step_r
            g = initial_g + i * step_g
            b = initial_b + i * step_b
            
            r = min(255, max(0, r))
            g = min(255, max(0, g))
            b = min(255, max(0, b))
            
            r = hex(r).replace('0x', '')
            g = hex(g).replace('0x', '')
            b = hex(b).replace('0x', '')
            
            if len(r) == 1: r = '0' + r
            if len(g) == 1: g = '0' + g
            if len(b) == 1: b = '0' + b
            
            colors.append(f"#{r}{g}{b}")
        return colors
    
    def draw_scatter_plot(self, columns, path):
        for col in columns:
            if self.column_data_ty[col] == 'Categorical':
                return False
        
        if len(columns) == 2:
            ax = self.dataset.plot.scatter(columns[0], columns[1], c=CustomColors.accent, alpha=0.25)
            self._change_style(ax)
            self._save_fig(ax, path)
        else:
            axs = pd.plotting.scatter_matrix(
                self.dataset.iloc[:, columns], 
                color=CustomColors.accent,
                density_kwds={'color':CustomColors.accent, 'alpha':0.75},
                alpha=0.125,
                diagonal='kde'
            )
            
            style_of_x_lab = 'right' if (len(columns) > 5) else 'center'
            for axr in axs:
                for ax in axr:
                    self._change_style(ax, full_box=True, transparent_axis=True)
                    ax.yaxis.label.set_rotation(30)
                    ax.xaxis.label.set_rotation(30)
                    ax.yaxis.label.set_ha('right')
                    ax.xaxis.label.set_ha(style_of_x_lab)
            
            self._save_fig(axs[0][0], path)
            
        return True
    
    def draw_box_plot(self, columns, path):
        _, ax = plt.subplots()
        if len(columns) == 1:
            self.dataset.boxplot(
                column = self.dataset.columns[columns[0]],
                color  = CustomColors.accent,
                sym    = CustomColors.accent,
                grid   = False,
                vert   = False,
                widths = 0.3,
                ax     = ax
            )
        elif len(columns) == 2 and self.column_data_ty[columns[1]] == "Categorical":
            if len(self.dataset.iloc[:, columns[1]].unique()) > 20:
                return False
            
            self.dataset.boxplot(
                column = self.dataset.columns[columns[0]],
                by     = self.dataset.columns[columns[1]],
                color  = CustomColors.accent,
                sym    = CustomColors.accent,
                ax     = ax
            )
            ax.get_figure().gca().set_title("")
            ax.get_figure().suptitle('')
        else:
            return False
        self._change_style(ax)
        self._save_fig(ax, path)
        return True

    def draw_violin_plot(self, columns, path):
        _, ax = plt.subplots()
        if len(columns) == 1:
            violin_parts = ax.violinplot(dataset=[self.dataset.iloc[:, columns[0]]], vert=False)
        elif len(columns) == 2 and self.column_data_ty[columns[1]] == "Categorical":
            col = self.dataset.columns[columns[0]]
            by  = self.dataset.columns[columns[1]]
            
            categories = self.dataset[by].unique()
            
            if len(categories) > 20:
                return False
            
            categories.sort()
            
            splits = []
            for cat in categories:
                splits.append(self.dataset[self.dataset[by] == cat][col])
                
            violin_parts = ax.violinplot(dataset=splits)
            
            ax.yaxis.grid(True)
        else:
            return False

        ax.set_xlabel(self.dataset.columns[columns[0]])

        for partname in ('cbars','cmins','cmaxes'):
            violin_parts[partname].set_edgecolor(CustomColors.accent)

        for vp in violin_parts['bodies']:
            vp.set_facecolor(CustomColors.accent)
            vp.set_alpha(0.5)
        
        self._change_style(ax)
        self._save_fig(ax, path)
        return True
    
    def draw_bar_plot(self, columns, path):
        if self.column_data_ty[columns[0]] != 'Categorical':
            return False
        
        col = self.dataset.columns[columns[0]]
        x = self.dataset[col].unique()
        
        if len(x) > 20:
            return False
        
        if len(columns) == 1:
            ax = self.dataset.value_counts(col, sort=True).plot.bar(color = CustomColors.accent)
        elif len(columns) == 2 and self.column_data_ty[columns[1]] == "Categorical":
            
            by = self.dataset.columns[columns[1]]
            y = self.dataset[by].unique()
            
            if len(y) > 20:
                return False
            
            x.sort()
            y.sort()
            
            ndf = {}
            for yi in y:
                # Column height calculation
                row = []
                for xi in x:
                    row.append(
                        self.dataset[
                            (self.dataset[col] == xi) & 
                            (self.dataset[by]  == yi)
                        ]
                        .count()
                        .values[0]
                    )
                ndf[yi]=row
                
            colors = self._generate_colors(len(y))
            
            ax = pd.DataFrame(ndf, x).plot.bar(color=colors)    
        else:
            return False
        
        self._change_style(ax)
        self._save_fig(ax, path)
        return True

    def draw_histogram(self, columns, path):
        if len(columns) > 4:
            return False
        
        for col in columns:
            if self.column_data_ty[col] == 'Categorical':
                return False
        
        axs = self.dataset.hist(
            self.dataset.columns[columns], 
            grid  = False, 
            color = CustomColors.accent
        )

        for axr in axs:
            for ax in axr:
                self._change_style(ax)
                ax.title.set_color('white')
        self._save_fig(axs[0][0], path)
        
        return True

    def draw_hexbin(self, columns, path):
        if len(columns) != 2:
            return False
        
        for col in columns:
            if self.column_data_ty[col] == 'Categorical':
                return False
        
        fig, ax = plt.subplots()
        s = ax.hexbin(
            x=self.dataset.columns[columns[0]],
            y=self.dataset.columns[columns[1]],
            cmap="viridis", 
            gridsize=15, 
            data=self.dataset
        )
        
        # Add colorbar
        color_bar = fig.colorbar(s)
        color_bar.ax.yaxis.set_tick_params(color="white")
        color_bar.outline.set_edgecolor("white")
        color_bar.ax.set_yticklabels(color_bar.get_ticks(), color="white")
        
        self._change_style(ax)
        self._save_fig(ax, path)
        
        return True
    
    def draw_density_plot(self, columns, path):
        if len(columns) > 6:
            return False
        
        for col in columns:
            if self.column_data_ty[col] == 'Categorical':
                return False
        
        colors = self._generate_colors(len(columns))
        ax = self.dataset.iloc[:, columns].plot.kde(color = colors)
        
        self._change_style(ax)
        self._save_fig(ax, path)
        
        return True

    def draw_pie_plot(self, column, path):
        
        if self.column_data_ty[column] != 'Categorical':
            return False
        
        _, ax = plt.subplots()
        data = self.dataset.iloc[:, column].value_counts()
        
        colors = self._generate_colors(len(data))

        wedges, _, _ = ax.pie(data,
                              autopct=lambda pct: "{:.1f}%".format(pct),
                              textprops=dict(color="white"),
                              colors=colors
                              )

        ax.legend(wedges, data.index,
                loc="center left",
                bbox_to_anchor=(1, 0, 0.5, 1))

        self._change_style(ax)
        self._save_fig(ax, path)
        
        return True
        