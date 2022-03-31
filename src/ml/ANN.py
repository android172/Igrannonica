
from math import sqrt
import random
import statistics
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader

from sklearn import metrics

from MLData import MLData
from StatisticsClassification import StatisticsClassification
from StatisticsRegression import StatisticsRegression


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class ANN:
    
    
    def __init__(self, annSettings = None) -> None:
        
        self.data = MLData()
        
        if (annSettings != None):
            self.load_settings(annSettings)
            return
        
        self.learning_rate = 0
        self.batch_size    = 0
        self.num_epochs    = 0
        self.input_size    = 0
        self.output_size   = 0
        self.model         = None
        self.train_loader  = None
        self.test_loader   = None
        self.optimizer     = None
        self.criterion     = None
        
    # Load data
    def initialize_random_data(self):
        train_dataset = [(x, random.randint(0, 1)) for x in torch.randn(512, self.input_size)]
        self.train_loader = DataLoader(dataset=train_dataset, batch_size=self.batch_size, shuffle=True)
        test_dataset = [(x, random.randint(0, 1)) for x in torch.randn(64, self.input_size)]
        self.test_loader = DataLoader(dataset=test_dataset, batch_size=self.batch_size, shuffle=True)
        
    def initialize_loaders(self):
        # Filter train data
        train_dataset = self.data.get_train_dataset()
        self.train_loader = DataLoader(dataset=train_dataset, batch_size=self.batch_size, shuffle=True)
        
        # Filter test data
        test_dataset = self.data.get_test_dataset()
        self.test_loader = DataLoader(dataset=test_dataset, batch_size=self.batch_size, shuffle=True)
    
    # #################### #
    # Working with a model #
    # #################### #
    
    # Load Settings
    def load_settings(self, annSettings):
        # Load settings
        self.learning_rate = annSettings.learningRate
        self.batch_size    = annSettings.batchSize
        self.num_epochs    = annSettings.numberOfEpochs
        self.input_size    = annSettings.inputSize
        self.output_size   = annSettings.outputSize
        num_of_layers  = len(annSettings.hiddenLayers)
        
        # Load problem type
        self.isRegression = annSettings.problemType == 0
         
        # Create ANN according to the given settings
        model = NN().to(device)
        # Add all hidden layers
        previous_layer = self.input_size
        for i in range(num_of_layers):
            model.add_module(f"layer_{i}", nn.Linear(previous_layer, annSettings.hiddenLayers[i]))
            previous_layer = annSettings.hiddenLayers[i]
            
            activation_function = annSettings.activationFunctions[i]
            if   activation_function == 0:
                model.add_module(f"ReLU[{i}]", nn.ReLU())
            elif activation_function == 1:
                model.add_module(f"LeakyReLU[{i}]", nn.LeakyReLU())
            elif activation_function == 2:
                model.add_module(f"Sigmoid[{i}]", nn.Sigmoid())
            elif activation_function == 3:
                model.add_module(f"Tanh[{i}]", nn.Tanh())
        model.add_module(f"layer_{num_of_layers}", nn.Linear(previous_layer, self.output_size))
        
        # Save model locally
        self.model = model
        
        # Initialize data loaders
        self.train_loader = None
        self.test_loader  = None 
        
        # Loss function
        if   annSettings.lossFunction == 0:
            self.criterion = nn.L1Loss()
        elif annSettings.lossFunction == 1:
            self.criterion = nn.MSELoss()
        else:
            self.criterion = nn.CrossEntropyLoss()
            
        # Regularization
        self.regularization_method = annSettings.regularization
        self.regularization_rate = annSettings.regularizationRate
        weight_decay = 0
        if self.regularization_method == 1:
            weight_decay = self.regularization_rate
        
        # Optimization algortham
        if   annSettings.optimizer == 0:
            self.optimizer = optim.SGD(model.parameters(), lr=self.learning_rate, weight_decay=weight_decay)
        elif annSettings.optimizer == 1:
            self.optimizer = optim.Adagrad(model.parameters(), lr=self.learning_rate, weight_decay=weight_decay)
        elif annSettings.optimizer == 2:
            self.optimizer = optim.Adadelta(model.parameters(), lr=self.learning_rate, weight_decay=weight_decay)
        else:
            self.optimizer = optim.Adam(model.parameters(), lr=self.learning_rate, weight_decay=weight_decay)
    
    # Training
    def train(self):
        if self.train_loader is None:
            self.initialize_loaders()
        
        # Train the network
        for epoch in range(self.num_epochs):
            for bach_index, (data, target) in enumerate(self.train_loader):
                data = data.to(device)
                target = target.to(device)
                data = data.reshape(data.shape[0], -1)
                
                # Forward
                scores = self.model.forward(data)
                loss = self.criterion(scores, target)
                
                if self.regularization_method == 0:
                    L1_reg = torch.tensor(0., requires_grad=True)
                    for name, param in self.model.named_parameters():
                        if 'weight' in name:
                            L1_reg = L1_reg + torch.norm(param, 1)
                    loss += self.regularization_rate * L1_reg
                
                # Backwards
                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()
    
    # Metrics
    def compute_regression_statistics(self, dataset):
        if self.train_loader is None:
            self.initialize_loaders()
            
        if   dataset == "train":
            loader = self.train_loader
        elif dataset == "test":
            loader = self.test_loader
        else:
            return
        
        actual = [[] for _ in range(self.output_size)]
        predicted = [[] for _ in range(self.output_size)]
        
        n = self.data.get_row_count()
        p = self.input_size
        
        self.model.eval()
        
        with torch.no_grad():
            for x, y in loader:
                x = x.to(device)
                y = y.to(device)
                x = x.reshape(x.shape[0], -1)
                
                y_p = self.model(x)
                
                for i in range(self.output_size):
                    actual[i].extend([j[i] for j in y.tolist()])
                    predicted[i].extend([j[i] for j in y_p.tolist()])
                
        self.model.train()
        
        statistics = {}
        for i in range(self.output_size):
            mae = metrics.mean_absolute_error(actual[i], predicted[i])
            mse = metrics.mean_squared_error(actual[i], predicted[i])
            rse = sqrt(mse * (n / (n - p - 1)))
            r2 = metrics.r2_score(actual[i], predicted[i])
            adjustedR2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)
            
            statistics[i] = StatisticsRegression(
                mae,
                mse,
                rse,
                r2,
                adjustedR2
            ).__dict__
        return statistics
    
    def compute_classification_statistics(self, dataset):
        if self.train_loader is None:
            self.initialize_loaders()
            
        if   dataset == "train":
            loader = self.train_loader
        elif dataset == "test":
            loader = self.test_loader
        else:
            return
        
        actual = []
        predicted = []
        
        self.model.eval()
        
        with torch.no_grad():
            for x, y in loader:
                x = x.to(device)
                y = y.to(device)
                x = x.reshape(x.shape[0], -1)
                
                scores = self.model(x)
                _, y_p = scores.max(1)
                
                actual.extend([i.index(max(i)) for i in y.tolist()])
                predicted.extend(y_p.tolist())
                
        self.model.train()
        
        Accuracy         = metrics.accuracy_score(actual, predicted)
        BalancedAccuracy = metrics.balanced_accuracy_score(actual, predicted)
        Precision        = metrics.precision_score(actual, predicted)
        Recall           = metrics.recall_score(actual, predicted)
        F1Score          = metrics.f1_score(actual, predicted)
        HammingLoss      = metrics.hamming_loss(actual, predicted)
        CrossEntropyLoss = metrics.log_loss(actual, predicted)
        ConfusionMatrix  = metrics.confusion_matrix(actual, predicted)
        
        return StatisticsClassification(
            Accuracy         = Accuracy,
            BalancedAccuracy = BalancedAccuracy,
            Precision        = Precision,
            Recall           = Recall,
            F1Score          = F1Score,
            HammingLoss      = HammingLoss,
            CrossEntropyLoss = CrossEntropyLoss,
            ConfusionMatrix  = ConfusionMatrix
        ).__dict__
    
class NN(nn.Module):
    def __init__(self) -> None:
        super(NN, self).__init__()
    
    def forward(self, x):
        i = 0
        for m in self.modules():
            if i == 0:
                i += 1
                continue
            x = m(x)
        return x