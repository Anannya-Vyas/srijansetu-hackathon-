import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader

class PretrainDenseNet:
    def __init__(self, data_dir="../datasets/pretrain", num_epochs=10, batch_size=32):
        self.data_dir = os.path.abspath(data_dir)
        self.num_epochs = num_epochs
        self.batch_size = batch_size
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")

        # Transforms for massive pretraining (MURA/RSNA)
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def load_data(self):
        print(f"Loading pretraining data from {self.data_dir}...")
        if not os.path.exists(self.data_dir) or not os.listdir(self.data_dir):
            print("Error: Pretraining dataset directory is empty or missing.")
            print("Please download RSNA, MURA, or MedMNIST into datasets/pretrain/")
            return None
        
        # Expecting subfolders for classes (e.g., normal/abnormal for MURA)
        dataset = datasets.ImageFolder(self.data_dir, self.transform)
        dataloader = DataLoader(dataset, batch_size=self.batch_size, shuffle=True, num_workers=4)
        return dataloader

    def build_model(self, num_classes):
        model = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)
        num_ftrs = model.classifier.in_features
        model.classifier = nn.Linear(num_ftrs, num_classes)
        return model.to(self.device)

    def train(self):
        dataloader = self.load_data()
        if dataloader is None:
            return

        num_classes = len(dataloader.dataset.classes)
        print(f"Found {num_classes} classes for pretraining.")
        
        model = self.build_model(num_classes)
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)

        print("Starting Pretraining Phase...")
        for epoch in range(self.num_epochs):
            model.train()
            running_loss = 0.0
            
            for inputs, labels in dataloader:
                inputs = inputs.to(self.device)
                labels = labels.to(self.device)

                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                running_loss += loss.item() * inputs.size(0)

            epoch_loss = running_loss / len(dataloader.dataset)
            print(f"Epoch {epoch+1}/{self.num_epochs} - Loss: {epoch_loss:.4f}")

        # Save foundational weights
        save_path = os.path.join(os.path.dirname(__file__), "densenet_bone_foundation.pth")
        torch.save(model.state_dict(), save_path)
        print(f"Pretraining complete. Foundational weights saved to {save_path}")

if __name__ == "__main__":
    pretrainer = PretrainDenseNet()
    pretrainer.train()
