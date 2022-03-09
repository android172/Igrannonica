from http import client
import socket

import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader
import random

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Network
class NN(nn.Module):
    def __init__(self, input_size, output_size) -> None:
        super(NN, self).__init__()
    
    def forward(self, x):
        i = 0
        for m in self.modules():
            if i == 0:
                i += 1
                continue
            x = m(x)
        return x

def get_accuracy(loader, model):
    num_correct = 0
    num_samples = 0
    
    model.eval()
    
    with torch.no_grad():
        for x, y in loader:
            x = x.to(device)
            y = y.to(device)
            x = x.reshape(x.shape[0], -1)
            
            scores = model(x)
            _, predictions = scores.max(1)
            
            num_correct += (predictions == y).sum()
            num_samples += predictions.size(0)
            
        print(num_correct / num_samples)
        
    model.train()

def train_on_random_data(input_size, output_size):
    # Params
    learning_rate = 0.001
    batch_size = 64
    num_epochs = 1

    # Load dataset
    # import torchvision
    # train_dataset = torchvision.datasets.MNIST(root='dataset/', train=True, transform=torchvision.transforms.ToTensor(), download=True)
    # train_loader = DataLoader(dataset=train_dataset, batch_size=batch_size, shuffle=True)
    # test_dataset = torchvision.datasets.MNIST(root='dataset/', train=False, transform=torchvision.transforms.ToTensor(), download=True)
    # test_loader = DataLoader(dataset=test_dataset, batch_size=batch_size, shuffle=True)

    train_dataset = [(x, random.randint(0, 1)) for x in torch.randn(512, input_size)]
    train_loader = DataLoader(dataset=train_dataset, batch_size=batch_size, shuffle=True)
    test_dataset = [(x, random.randint(0, 1)) for x in torch.randn(64, input_size)]
    test_loader = DataLoader(dataset=test_dataset, batch_size=batch_size, shuffle=True)

    # Initialize model
    model = NN(input_size=input_size, output_size=output_size).to(device)
    model.add_module("l1", nn.Linear(input_size, 50))
    model.add_module("ReLU", nn.ReLU())
    model.add_module("l2", nn.Linear(50, output_size))

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # Train the network
    for epoch in range(num_epochs):
        for bach_index, (data, target) in enumerate(train_loader):
            data = data.to(device)
            target = target.to(device)
            data = data.reshape(data.shape[0], -1)
            
            # Forward
            scores = model.forward(data)
            loss = criterion(scores, target)
            
            # Backwards
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
    
    get_accuracy(train_loader, model)
    get_accuracy(test_loader, model)

# Global
ipAddress, port = "127.0.0.1", 25001

# Process comunication
class SocketServer():
    def __init__(self) -> None:
        self.socket = socket.socket()
        socket.setdefaulttimeout(None)
        self.socket.bind((ipAddress, port))
        self.socket.listen(30)
        
    def accept(self):
        self.client, self.clientAddress = self.socket.accept()
    
    def read(self):
        return self.client.recv(1024).decode()
    
    def write(self, message):
        self.client.sendall(message.encode())
        
    def close(self):
        self.client.close()

def main():
    
    print("Creating serever...")
    server = SocketServer()
    
    print("Awaiting connection...")
    server.accept()
    
    print("Receiving data...")
    input_size, output_size = [int(x) for x in server.read().split(":")]
    
    server.close()
    
    train_on_random_data(input_size, output_size)

if __name__ == "__main__":
    main()