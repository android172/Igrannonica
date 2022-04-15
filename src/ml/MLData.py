import random
import pandas as pd

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor

from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import OrdinalEncoder
from sklearn.linear_model import LinearRegression
from scipy import stats
from sklearn.svm import OneClassSVM

from torch import tensor
from StatisticsCategorical import StatisticsCategorical

from StatisticsNumerical import StatisticsNumerical

class MLData:
    
    def __init__(self) -> None:
        self.dataset        = None
        self.input_columns  = None
        self.output_columns = None
        self.train_indices  = None
        self.test_indices   = None
        self.column_types   = None
    
    # Load dataset
    def load_from_csv(self, pathOrBuffer):
        dataset = pd.read_csv(pathOrBuffer)
        self._load_dataset(dataset)
    
    def load_from_json(self, pathOrBuffer):
        dataset = pd.read_json(pathOrBuffer)
        self._load_dataset(dataset)
    
    def load_from_excel(self, pathOrBuffer):
        dataset = pd.read_excel(pathOrBuffer)
        self._load_dataset(dataset)
    
    def _load_dataset(self, dataset):
        self.dataset = dataset
        self.train_indices = [i for i in range(self.dataset.shape[0])]
        self.test_indices = []
        self._update_column_types()
    
    def _update_column_types(self):
        self.column_types = self.dataset.dtypes
    
    def load_test_from_csv(self, pathOrBuffer):
        dataset_test = pd.read_csv(pathOrBuffer)
        self._load_test_dataset(dataset_test)
    
    def load_test_from_json(self, pathOrBuffer):
        dataset_test = pd.read_json(pathOrBuffer)
        self._load_test_dataset(dataset_test)
        
    def load_test_from_excel(self, pathOrBuffer):
        dataset_test = pd.read_excel(pathOrBuffer)
        self._load_test_dataset(dataset_test)
        
    def _load_test_dataset(self, dataset_test):
        train_length = self.dataset.shape[0]
        self.dataset = pd.concat([self.dataset, dataset_test])
        self.train_indices = [i for i in range(train_length)]
        self.test_indices = [i for i in range(train_length, self.dataset.shape[0])]
        
    # Save changes
    def save_to_csv(self, path):
        self.dataset.to_csv(path)
    
    def save_to_json(self, path):
        self.dataset.to_json(path)
        
    def save_to_excel(self, path):
        self.dataset.to_excel(path)
        
    # Select columns
    def select_input_columns(self, columns):
        column_types = self.get_column_types()
        for ci in columns:
            if column_types[ci] != 'int64' and column_types[ci] != 'float64':
                return False
        self.input_columns = columns
        return True
    
    def select_output_columns(self, columns):
        column_types = self.get_column_types()
        for ci in columns:
            if column_types[ci] != 'int64' and column_types[ci] != 'float64':
                return False
        self.output_columns = columns
        return True
    
    # Train test splits
    def random_train_test_split(self, ratio):
        dataset_length = self.dataset.shape[0]
        split_point = int(dataset_length * (1.0 - ratio))
        
        # Initialize index lists
        index_list = [i for i in range(dataset_length)]
        random.shuffle(index_list)
        self.train_indices = index_list[:split_point]
        self.test_indices  = index_list[split_point:]

    # ########### #
    # Data access #
    # ########### #
    
    def columns_are_valid(self, columns):
        length = self.dataset.shape[1]
        for column in columns:
            if column < 0 or column >= length:
                return False
        return True
    
    def get_train_dataset(self):
        train_data = []
        for i in self.train_indices:
            x = tensor(self.dataset.iloc[i, self.input_columns]).float()
            y = tensor(self.dataset.iloc[i, self.output_columns]).float()
            train_data.append((x, y))
        return train_data
    
    def get_test_dataset(self):
        test_data = []
        for i in self.test_indices:
            x = tensor(self.dataset.iloc[i, self.input_columns]).float()
            y = tensor(self.dataset.iloc[i, self.output_columns]).float()
            test_data.append((x, y))
        return test_data
    
    def get_rows(self, rows):
        return self.dataset.iloc[rows]
    
    def get_row_count(self):
        return self.dataset.shape[0]
    
    def get_column_types(self):
        return [str(i) for i in self.dataset.dtypes]
    
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
        
        self.dataset.iloc[row, column] = value
        return 0

    def add_row(self, new_row, test=False):
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
        # import values
        self.dataset.loc[self.dataset.shape[0]] = series
        
        if test == False:
            self.train_indices.append(self.dataset.shape[0])
        else:
            self.test_indices.append(self.dataset.shape[0])
        return -1
    
    def update_row(self, row, new_row):
        if row < 0 or row >= self.dataset.shape[0]:
            return -2
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
        # Replace values
        self.dataset.iloc[row] = series
        return -1
    
    def remove_row(self, row):
        if row < 0 or row >= self.dataset.shape[0]:
            return False
        self.dataset.drop(self.dataset.index[row], inplace=True, )
        self.train_indices = [index - 1 if index > row else index for index in self.train_indices if index != row]
        self.test_indices  = [index - 1 if index > row else index for index in self.test_indices  if index != row]
        return True
            
    def add_column(self, new_column, label):
        series = pd.Series(new_column, name=label)
        self.dataset = self.dataset.join(series)
        self._update_column_types()
    
    def update_column(self, column, new_column=None, new_label=None):
        if new_label is not None:
            self.dataset.rename(columns={self.dataset.columns[column]:new_label}, inplace=True)
        if new_column is not None:
            self.dataset.iloc[:, column] = new_column
        self._update_column_types()
        
    def remove_column(self, column):
        self.dataset.drop(self.dataset.columns[column], axis=1, inplace=True)
        self._update_column_types()
            
    # Handeling NA values
    def replace_value_with_na(self, columns, value):
        self.dataset.iloc[:, columns] = self.dataset.iloc[:, columns].replace(value, pd.NA)
    
    def drop_na_listwise(self):
        self.dataset.dropna(inplace=True)
    
    def drop_na_columns(self):
        self.dataset.dropna(axis=1, inplace=True)

    def drop_na_pairwise(self, columns):
        subset = self.dataset.columns[columns]
        self.dataset.dropna(subset=subset, inplace=True)
        
    # NA imputing
    def replace_na_with_mean(self, columns):
        try: means = self.dataset.iloc[:, columns].replace(pd.NA, np.nan).astype('float64').mean()
        except: return False
        self.dataset.fillna(means, inplace=True)
        self.dataset.iloc[:, columns] = self.dataset.iloc[:, columns].astype('float64')
        return True
    
    def replace_na_with_median(self, columns):
        try: medians = self.dataset.iloc[:, columns].replace(pd.NA, np.nan).astype('float64').median()
        except: return False
        self.dataset.fillna(medians, inplace=True)
        for i in columns:
            if self.column_types[i] == 'int64':
                self.dataset.iloc[:, i] = self.dataset.iloc[:, i].astype('int64')
            elif self.column_types[i] == 'float64':
                self.dataset.iloc[:, i] = self.dataset.iloc[:, i].astype('float64')
        return True
    
    def replace_na_with_mode(self, columns):
        modes = self.dataset.iloc[:, columns].astype(str).replace("<NA>", pd.NA).mode().iloc[0]
        self.dataset.fillna(modes, inplace=True)
        for i in columns:
            if self.column_types[i] == 'int64':
                self.dataset.iloc[:, i] = self.dataset.iloc[:, i].astype('int64')
            elif self.column_types[i] == 'float64':
                self.dataset.iloc[:, i] = self.dataset.iloc[:, i].astype('float64')
        
    def replace_na_with_regression(self, column, input_columns):
        if self.dataset.iloc[:, input_columns].isna().any().any() == True:
            return
        
        na_rows = self.dataset.iloc[:, column].isna()
        not_na_rows = [not x for x in na_rows]
        inputs = self.dataset[not_na_rows].iloc[:, input_columns]
        try: output = self.dataset[not_na_rows].iloc[:, column].astype('float64')
        except: return False
        
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
        self.dataset.iloc[:, columns] = OrdinalEncoder().fit_transform(self.dataset.iloc[:, columns])
        self._update_column_types()
    
    def one_hot_encode_columns(self, columns):
        encoder = OneHotEncoder()
        result = encoder.fit_transform(self.dataset.iloc[:, columns]).toarray()
        new_columns = [self.dataset.columns[columns[i]] + str(group) 
                    for i in range(len(columns)) for group in encoder.categories_[i]]
        self.dataset.drop(self.dataset.columns[columns], axis=1, inplace=True)
        self.dataset[new_columns] = result
        self._update_column_types()
    
    # Normalization
    def maximum_absolute_scaling(self, columns):
        for ci in columns:
            column = self.dataset.iloc[:, ci]
            try: self.dataset.iloc[:, ci] = column / column.abs().max()
            except: return ci
        self._update_column_types()
        return -1
    
    def min_max_scaling(self, columns):
        for ci in columns:
            column = self.dataset.iloc[:, ci]
            try: self.dataset.iloc[:, ci] = (column - column.min()) / (column.max() - column.min())
            except: return ci
        self._update_column_types()
        return -1
    
    def z_score_scaling(self, columns):
        for ci in columns:
            column = self.dataset.iloc[:, ci]
            try: self.dataset.iloc[:, ci] = (column - column.mean()) / column.std()
            except: return ci
        self._update_column_types()
        return -1
        
    # Outlier detection    
    def standard_deviation_outlier_removal(self, columns, treshold):
        try: sub_df = self.dataset.iloc[:, columns].astype('float64')
        except: return False
        self.dataset = self.dataset[(np.abs(sub_df - sub_df.mean()) < treshold * sub_df.std()).all(axis=1)]
        return True
    
    def quantile_outlier_removal(self, columns, treshold):
        try: sub_df = self.dataset.iloc[:, columns].astype('float64')
        except: return False
        self.dataset = self.dataset[((sub_df > sub_df.quantile(treshold)) & (sub_df < sub_df.quantile(1 - treshold))).all(axis=1)]
        return True
    
    def z_score_outlier_removal(self, columns, treshold):
        try: sub_df = self.dataset.iloc[:, columns].astype('float64')
        except: return False
        self.dataset = self.dataset[(np.abs(stats.zscore(sub_df)) < treshold).all(axis=1)]
        return True
        
    def iqr_outlier_removal(self, columns):
        try: sub_df = self.dataset.iloc[:, columns].astype('float64')
        except: return False
        
        q1 = sub_df.quantile(0.25)
        q3 = sub_df.quantile(0.75)
        iqr = 1.5 * (q3 - q1)
        self.dataset = self.dataset[((sub_df > q1 - iqr) & (sub_df < q3 + iqr)).all(axis=1)]
        return True
    
    def isolation_forest_outlier_removal(self, columns):
        try:
            rows = IsolationForest().fit_predict(self.dataset.iloc[:, columns])
            self.dataset = self.dataset[np.where(rows == 1, True, False)]
            return True
        except:
            return False
        
    def one_class_svm_outlier_removal(self, columns):
        try:
            rows = OneClassSVM().fit_predict(self.dataset.iloc[:, columns])
            self.dataset = self.dataset[np.where(rows == 1, True, False)]
            return True
        except:
            return False
    
    def local_outlier_factor_outlier_removal(self, columns):
        try:
            rows = LocalOutlierFactor().fit_predict(self.dataset.iloc[:, columns])
            self.dataset = self.dataset[np.where(rows == 1, True, False)]
            return True
        except:
            return False
            
    # ######## #
    # Analysis #
    # ######## #
    def get_numerical_statistics(self, columns):
        column_names = self.dataset.columns[columns]
        
        try: description = self.dataset[column_names].astype('float64').describe()
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
    