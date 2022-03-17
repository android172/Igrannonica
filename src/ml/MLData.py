from base64 import encode
import random
import pandas as pd
from sklearn import datasets

from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import OrdinalEncoder

class MLData:
    
    def __init__(self) -> None:
        self.dataset        = None
        self.dataset_test   = None
        self.input_columns  = None
        self.output_columns = None
        
    def get_train_dataset(self):
        return [(self.dataset.iloc[i, self.input_columns], self.dataset.iloc[i, self.output_columns]) 
                for i in range(self.dataset.shape[0])]
    
    def get_test_dataset(self):
        return [(self.dataset_test.iloc[i, self.input_columns], self.dataset_test.iloc[i, self.output_columns])
                for i in range(self.dataset_test.shape[0])]
    
    # Load dataset
    def load_from_csv(self, path):
        self.train_loader = None
        self.dataset = pd.read_csv(path)
        
    def load_test_from_csv(self, path):
        self.train_loader = None
        self.dataset_test = pd.read_csv(path)
    
    # Select columns
    def select_input_columns(self, columns):
        self.train_loader = None
        self.input_columns = columns
    
    def select_output_columns(self, columns):
        self.train_loader = None
        self.output_columns = columns
    
    # Train test splits
    def random_train_test_split(self, ratio):
        self.train_loader = None
        dataset_length = self.dataset.shape[0]
        split_point = int(dataset_length * ratio)
        
        # Initialize index lists
        index_list = [i for i in range(dataset_length)]
        random.shuffle(index_list)
        train_index_list = index_list[:split_point]
        test_index_list = index_list[split_point:]
        
        # Filter train and test data data
        self.dataset_test = self.dataset.iloc[test_index_list]
        self.dataset      = self.dataset.iloc[train_index_list]
    
    # ################# #
    # Data manipulation #
    # ################# #
    
    # Handeling NA values
    def replace_value_with_na(self, columns, value, test=False):
        if test == False:
            self.replace_value_with_na(columns, value, True)
            dataset = self.dataset
        else:
            dataset = self.dataset_test
        if dataset is None:
            return
            
        dataset.iloc[:, columns] = dataset.iloc[:, columns].replace(value, pd.NA)
    
    def drop_na_listwise(self, test=False):
        if test == False:
            self.drop_na_listwise(True)
            dataset = self.dataset
        else:
            dataset = self.dataset_test
        if dataset is None:
            return
        
        dataset.dropna(inplace=True)
    
    def drop_na_columns(self, test=False):
        if test == False:
            self.drop_na_columns(True)
            dataset = self.dataset
        else:
            dataset = self.dataset_test
        if dataset is None:
            return
        
        dataset.dropna(axis=1, inplace=True)

    def drop_na_pairwise(self, test=False):
        if test == False:
            self.drop_na_pairwise(True)
            dataset = self.dataset
        else:
            dataset = self.dataset_test
        if dataset is None or self.input_columns is None or self.output_columns is None:
            return
        
        subset = dataset.columns[self.input_columns + self.output_columns]
        dataset.dropna(subset=subset, inplace=True)
    
    def drop_na_from_column(self, column, test=False):
        if test == False:
            self.drop_na_from_column(column, True)
            dataset = self.dataset
        else:
            dataset = self.dataset_test
        if dataset is None:
            return
        
        subset = dataset.columns[[column]]
        dataset.dropna(subset=subset, inplace=True)
        
    # Value encoding
    def label_encode_columns(self, columns, test=False):
        if test == False:
            self.label_encode_columns(columns, True)
            dataset = self.dataset
        else:
            dataset = self.dataset_test
        if dataset is None:
            return
        
        dataset.iloc[:, columns] = OrdinalEncoder().fit_transform(dataset.iloc[:, columns])
    
    def one_hot_encode_columns(self, columns, test=False):
        if test == False:
            self.one_hot_encode_columns(columns, True)
            dataset = self.dataset
        else:
            dataset = self.dataset_test
        if dataset is None:
            return
        
        encoder = OneHotEncoder()
        result = encoder.fit_transform(dataset.iloc[:, columns]).toarray()
        new_columns = [dataset.columns[columns[i]] + group 
                    for i in range(len(columns)) for group in encoder.categories_[i]]
        dataset.drop(dataset.iloc[:, columns], axis=1, inplace=True)
        dataset[new_columns] = result