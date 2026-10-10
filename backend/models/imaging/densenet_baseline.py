import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import os

def train_image_model(data_dir: str, num_epochs: int = 10, batch_size: int = 32):
    """
    Trains a DenseNet121 baseline model for Stage 3 image classification.
    """
    if not os.path.exists(data_dir):
        print(f"Data directory {data_dir} not found. Please organize images into train/val folders.")
        return

    # Data transforms
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # Load datasets
    image_datasets = {x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
                      for x in ['train', 'val']}
    dataloaders = {x: DataLoader(image_datasets[x], batch_size=batch_size, shuffle=True, num_workers=4)
                   for x in ['train', 'val']}
    
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load pretrained DenseNet
    model = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
    num_ftrs = model.classifier.in_features
    
    # 3 Classes: Normal, Osteopenia, Osteoporosis
    model.classifier = nn.Linear(num_ftrs, 3) 
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=0.001)

    # Simple training loop (Team to expand)
    for epoch in range(num_epochs):
        print(f'Epoch {epoch}/{num_epochs - 1}')
        print('-' * 10)
        
        # Training and validation logic goes here...
        # ...

    # Save model
    torch.save(model.state_dict(), 'densenet_baseline.pth')
    print("Model saved to densenet_baseline.pth")

if __name__ == "__main__":
    train_image_model(data_dir="../../datasets/xray/")
