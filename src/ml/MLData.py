from base64 import encode
import random
import pandas as pd

from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import OrdinalEncoder
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import  KNeighborsClassifier

class MLData:
    
    def __init__(self) -> None:
        self.dataset        = None
        self.input_columns  = None
        self.output_columns = None
        self.train_indices  = None
        self.test_indices   = None
        
    def get_train_dataset(self):
        return [(self.dataset.iloc[i, self.input_columns], self.dataset.iloc[i, self.output_columns]) 
                for i in self.train_indices]
    
    def get_test_dataset(self):
        return [(self.dataset.iloc[i, self.input_columns], self.dataset.iloc[i, self.output_columns])
                for i in self.test_indices]
    
    # Load dataset
    def load_from_csv(self, path):
        self.dataset = pd.read_csv(path)
        
    def load_test_from_csv(self, path):
        train_length = self.dataset.shape[0]
        
        dataset_test = pd.read_csv(path)
        self.dataset = pd.concat([self.dataset, dataset_test])
        
        self.train_indices = [i for i in range(train_length)]
        self.test_indices = [i for i in range(train_length, self.dataset.shape[0])]
    
    # Select columns
    def select_input_columns(self, columns):
        self.input_columns = columns
    
    def select_output_columns(self, columns):
        self.output_columns = columns
    
    # Train test splits
    def random_train_test_split(self, ratio):
        dataset_length = self.dataset.shape[0]
        split_point = int(dataset_length * ratio)
        
        # Initialize index lists
        index_list = [i for i in range(dataset_length)]
        random.shuffle(index_list)
        self.train_indices = index_list[:split_point]
        self.test_indices  = index_list[split_point:]
    
    # ################# #
    # Data manipulation #
    # ################# #
    
    # Handeling NA values
    def replace_value_with_na(self, columns, value):
        self.dataset.iloc[:, columns] = self.dataset.iloc[:, columns].replace(value, pd.NA)
    
    def drop_na_listwise(self):
        self.dataset.dropna(inplace=True)
    
    def drop_na_columns(self):
        self.dataset.dropna(axis=1, inplace=True)

    def drop_na_pairwise(self):
        subset = self.dataset.columns[self.input_columns + self.output_columns]
        self.dataset.dropna(subset=subset, inplace=True)
    
    def drop_na_from_column(self, column):
        subset = self.dataset.columns[[column]]
        self.dataset.dropna(subset=subset, inplace=True)
        
    # NA imputing
    def replace_na_with_mean(self, columns):
        means = self.dataset.iloc[:, columns].mean()
        self.dataset.fillna(means, inplace=True)
    
    def replace_na_with_median(self, columns):
        medians = self.dataset.iloc[:, columns].median()
        self.dataset.fillna(medians, inplace=True)
    
    def replace_na_with_mode(self, columns):
        modes = self.dataset.iloc[:, columns].mode().iloc[0]
        self.dataset.fillna(modes, inplace=True)
        
    def replace_na_with_regression(self, column, input_columns):
        if self.dataset.iloc[:, input_columns].isna().any().any() == True:
            return
        
        na_rows = self.dataset.iloc[:, column].isna()
        not_na_rows = [not x for x in na_rows]
        inputs = self.dataset[not_na_rows].iloc[:, input_columns]
        output = self.dataset[not_na_rows].iloc[:, column]
        
        regression = LinearRegression().fit(inputs, output)
        predictions = regression.predict(self.dataset[na_rows].iloc[:, input_columns])
        self.dataset.loc[na_rows, self.dataset.columns[column]] = predictions
        
    # Value encoding
    def label_encode_columns(self, columns):
        self.dataset.iloc[:, columns] = OrdinalEncoder().fit_transform(self.dataset.iloc[:, columns])
    
    def one_hot_encode_columns(self, columns):
        encoder = OneHotEncoder()
        result = encoder.fit_transform(self.dataset.iloc[:, columns]).toarray()
        new_columns = [self.dataset.columns[columns[i]] + group 
                    for i in range(len(columns)) for group in encoder.categories_[i]]
        self.dataset.drop(self.dataset.columns[columns], axis=1, inplace=True)
        self.dataset[new_columns] = result