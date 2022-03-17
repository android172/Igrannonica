
import random
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader

from MLData import MLData

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
         
        # Create ANN according to the given settings
        model = NN().to(device)
        # Add all hidden layers
        previous_layer = self.input_size
        for i in range(num_of_layers):
            model.add_module(f"layer_{i}", nn.Linear(previous_layer, annSettings.hiddenLayers[i]))
            previous_layer = annSettings.hiddenLayers[i]
            
            activation_function = annSettings.activationFunctions[i]
            if activation_function == 0:
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
        self.criterion = nn.CrossEntropyLoss()
        
        # Optimization algortham
        self.optimizer = optim.Adam(model.parameters(), lr=self.learning_rate)
    
    # Metrics
    def get_accuracy(self, dataset):
        if self.train_loader is None:
            self.initialize_loaders()
            
        if   dataset == "train":
            loader = self.train_loader
        elif dataset == "test":
            loader = self.test_loader
        else:
            return
        
        num_correct = 0
        num_samples = 0
        
        self.model.eval()
        
        with torch.no_grad():
            for x, y in loader:
                x = x.to(device)
                y = y.to(device)
                x = x.reshape(x.shape[0], -1)
                
                scores = self.model(x)
                _, predictions = scores.max(1)
                
                num_correct += (predictions == y).sum()
                num_samples += predictions.size(0)
            
        self.model.train()
        
        return num_correct / num_samples
    
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
                
                # Backwards
                self.optimizer.zero_grad()
                loss.backward()
                self.optimizer.step()
    
    
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