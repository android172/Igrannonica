
from math import sqrt
import random
import threading
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torch.utils.data import SubsetRandomSampler

from sklearn import metrics
from sklearn.model_selection import KFold

from MLData import MLData
from Models.StatisticsClassification import StatisticsClassification
from Models.StatisticsRegression import StatisticsRegression


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class ANN:
    
    def __init__(self, annSettings = None) -> None:
        self.data = MLData()
        
        self.isRunning = threading.Event()
        
        self.learning_rate = 0
        self.batch_size    = 0
        self.num_epochs    = 0
        self.current_epoch = 0
        self.input_size    = 0
        self.output_size   = 0
        self.optim_method  = 0
        self.hidden_layers = None
        self.activation_fn = None
        self.model         = None
        self.train_loader  = None
        self.test_loader   = None
        self.optimizer     = None
        self.criterion     = None
        self.isRegression  = False
        self.cv            = False
        self.cv_k          = 0
        self.regularization_method = 0
        self.regularization_rate   = 0.0
        self.weights_history = {}
        
        self.dataset_version = None
        
        if (annSettings != None):
            self.load_settings(annSettings)
    
    def create_deep_copy(self):
        
        new_ann = ANN()
        
        new_ann.data = self.data
        
        new_ann.learning_rate = self.learning_rate
        new_ann.batch_size    = self.batch_size   
        new_ann.num_epochs    = self.num_epochs   
        new_ann.current_epoch = self.current_epoch
        new_ann.input_size    = self.input_size   
        new_ann.output_size   = self.output_size  
        new_ann.optim_method  = self.optim_method 
        new_ann.cv            = self.cv
        new_ann.cv_k          = self.cv_k
        new_ann.isRegression  = self.isRegression
        
        new_ann.dataset_version = self.dataset_version
        
        new_ann.hidden_layers = [x for x in self.hidden_layers]
        new_ann.activation_fn = [x for x in self.activation_fn]
        
        new_ann.regularization_method = self.regularization_method
        new_ann.regularization_rate   = self.regularization_rate
        
        # Loss function
        if   self.criterion is nn.L1Loss:
            new_ann.criterion = nn.L1Loss()
        elif self.criterion is nn.MSELoss:
            new_ann.criterion = nn.MSELoss()
        else:
            new_ann.criterion = nn.CrossEntropyLoss()
        
        new_ann.create_new_network()
        
        new_ann.model.load_state_dict(self.model.state_dict())
        
        new_ann.weights_history = {}
        
        return new_ann
        
    # Load data
    def initialize_random_data(self):
        train_dataset = [(x, random.randint(0, 1)) for x in torch.randn(512, self.input_size)]
        self.train_loader = DataLoader(dataset=train_dataset, batch_size=self.batch_size, shuffle=True)
        test_dataset = [(x, random.randint(0, 1)) for x in torch.randn(64, self.input_size)]
        self.test_loader = DataLoader(dataset=test_dataset, batch_size=self.batch_size, shuffle=True)
        
    def initialize_loaders(self):
        # Filter train data
        train_dataset = self.data.get_train_dataset()
        if len(train_dataset) > 0:
            self.train_loader = DataLoader(dataset=train_dataset, batch_size=self.batch_size, shuffle=True)
        
        # Filter test data
        test_dataset = self.data.get_test_dataset()
        if len(test_dataset) > 0:
            self.test_loader = DataLoader(dataset=test_dataset, batch_size=self.batch_size, shuffle=True)
    
    # #################### #
    # Working with a model #
    # #################### #
    
    # Load Settings
    def load_settings(self, annSettings):
        self.learning_rate = annSettings.learningRate
        self.batch_size    = annSettings.batchSize
        self.num_epochs    = annSettings.numberOfEpochs
        self.current_epoch = annSettings.currentEpoch
        self.input_size    = annSettings.inputSize
        self.output_size   = annSettings.outputSize
        self.hidden_layers = annSettings.hiddenLayers
        self.activation_fn = annSettings.activationFunctions
        self.optim_method  = annSettings.optimizer
        
        # Load problem type
        self.isRegression = annSettings.problemType == 0
        
        # Load validation if needed
        self.cv_k = annSettings.kFoldCV
        self.cv   = self.cv_k > 1
        
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
        
    def create_new_network(self):
        self.weights_history = {}
    
        num_of_layers  = len(self.hidden_layers)
        
        # Create ANN according to the given settings
        model = NN().to(device)
        # Add all hidden layers
        previous_layer = self.input_size
        for i in range(num_of_layers):
            model.add_module(f"layer_{i}", nn.Linear(previous_layer, self.hidden_layers[i]))
            previous_layer = self.hidden_layers[i]
            
            activation_function = self.activation_fn[i]
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
        
        # Regularization
        weight_decay = 0
        if self.regularization_method == 1:
            weight_decay = self.regularization_rate
            
        # Optimization algortham
        if   self.optim_method == 0:
            self.optimizer = optim.SGD(model.parameters(), lr=self.learning_rate, weight_decay=weight_decay)
        elif self.optim_method == 1:
            self.optimizer = optim.Adagrad(model.parameters(), lr=self.learning_rate, weight_decay=weight_decay)
        elif self.optim_method == 2:
            self.optimizer = optim.Adadelta(model.parameters(), lr=self.learning_rate, weight_decay=weight_decay)
        else:
            self.optimizer = optim.Adam(model.parameters(), lr=self.learning_rate, weight_decay=weight_decay)
    
    # Weights
    def get_weights(self):
        weights = []
        for layer, layer_weights in self.model.state_dict().items():
            if layer[-4:] != 'bias':
                weights.append(layer_weights.tolist())
        return weights
    
    def load_weights(self, weights_path):
        state_dict = torch.load(weights_path)
        return self.load_state_dict(state_dict)

    def load_weights_at(self, epoch):
        state_dict = self.weights_history.get(epoch, None)
        if state_dict == None:
            return False
        return self.load_state_dict(state_dict)
    
    def save_weights(self, path):
        torch.save(self.model.state_dict(), path)
    
    def load_state_dict(self, state_dict):
        if state_dict is None:
            return False
        a, b = self.model.load_state_dict(state_dict)
        if len(a) > 0 or len(b) > 0:
            return False
        return True
    
    # Training
    def train_epoch(self, train_loader):
        for bach_index, (data, target) in enumerate(train_loader):
            
            self.isRunning.wait()
            
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
        return loss.item()

    def test_epoch(self, test_loader):
        test_loss = 0.0
        
        self.model.eval()
        for bach_index, (data, target) in enumerate(test_loader):
            
            self.isRunning.wait()
            
            data = data.to(device)
            target = target.to(device)
            data = data.reshape(data.shape[0], -1)
            
            # Forward
            scores = self.model.forward(data)
            loss = self.criterion(scores, target)
            
            test_loss += loss.item()
        
        self.model.train()
        
        return test_loss / len(test_loader)
    
    def train(self):
        # Train the network
        if self.cv:
            # Train with K-Fold Cross Validation
            train_dataset = self.data.get_train_dataset()
            
            initial_state = {k:v for k,v in self.model.state_dict().items()}
            
            for fold, (train_indices, validation_indices) in enumerate(KFold(self.cv_k, shuffle=True).split(train_dataset)):
                train_subs = SubsetRandomSampler(train_indices)
                val_subs   = SubsetRandomSampler(validation_indices)
                train_loader = DataLoader(dataset=train_dataset, batch_size=self.batch_size, sampler=train_subs)
                val_loader   = DataLoader(dataset=train_dataset, batch_size=self.batch_size, sampler=val_subs)
                
                self.model.load_state_dict(initial_state)
                
                while self.current_epoch < self.num_epochs:
                    loss = self.train_epoch(train_loader)
                    valLoss = self.test_epoch(val_loader)
                    yield {
                        "fold"    : fold,
                        "epoch"   : self.current_epoch,
                        "loss"    : loss,
                        "valLoss" : valLoss,
                        "weights" : self.get_weights()
                    }
                    self.weights_history[f"{fold}:{self.current_epoch}"] = {j:k for j, k in self.model.state_dict().items()}
                    self.current_epoch = self.current_epoch + 1
            
        else:
            if self.train_loader is None:
                self.initialize_loaders()
            while self.current_epoch < self.num_epochs:
                loss = self.train_epoch(self.train_loader)
                yield {
                    "epoch" : self.current_epoch,
                    "loss"  : loss,
                    "weights" : self.get_weights() 
                }
                self.weights_history[f"{self.current_epoch}"] = {j:k for j, k in self.model.state_dict().items()}
                self.current_epoch = self.current_epoch + 1
    
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
        
    # Prediction
    def predict(self, inputs):
        inputs = torch.tensor(inputs).to(device)
        
        outputs = self.model(inputs)
        
        if self.isRegression:
            return outputs.tolist()
        
        _, y_p = outputs.max(0)
        return y_p.tolist()
    
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