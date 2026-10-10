import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

class LateFusionMLP(nn.Module):
    """
    A simple MLP that takes:
    - 1 scalar (clinical risk score)
    - 3 logits (from image CNN: Normal, Osteopenia, Osteoporosis)
    and predicts the final 3 classes.
    """
    def __init__(self, input_dim=4, hidden_dim=8, num_classes=3):
        super(LateFusionMLP, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)
        
    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)
        return out

def train_fusion_model():
    """
    Placeholder for training the simple fusion MLP.
    Team should construct a dataset of paired (clinical_risk, image_logits) -> true_label
    """
    print("Initializing Fusion MLP...")
    model = LateFusionMLP(input_dim=4, hidden_dim=16, num_classes=3)
    
    # Example Dummy Data: [risk_score, cnn_logit_1, cnn_logit_2, cnn_logit_3]
    dummy_inputs = torch.randn(10, 4) 
    dummy_labels = torch.randint(0, 3, (10,))
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    
    for epoch in range(50):
        optimizer.zero_grad()
        outputs = model(dummy_inputs)
        loss = criterion(outputs, dummy_labels)
        loss.backward()
        optimizer.step()
        
    print("Fusion model trained on dummy data.")
    torch.save(model.state_dict(), 'late_fusion.pth')

if __name__ == "__main__":
    train_fusion_model()
