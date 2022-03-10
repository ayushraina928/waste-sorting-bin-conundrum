import torch
import matplotlib.pyplot as plt
import numpy as np
from torchvision import datasets
from torch.utils.data import Subset
from sklearn.model_selection import train_test_split
from pathlib import Path
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True


def imshow(inp,class_indices = None,class_names = None):
    inp = inp.numpy().transpose((1, 2, 0))
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    inp = std * inp + mean
    inp = np.clip(inp, 0, 1)
    plt.imshow(inp)
    if class_names is not None:
        title=[class_names[x] for x in class_indices]
        plt.title(title)
    plt.pause(0.001)  # pause a bit so that plots are updated


def check_valid(path):
    path = Path(path)
    return not (path.stem.startswith('.') or path.stem.startswith('_'))
    
#Function to split dataset into train and test
def train_val_dataset(dataset, val_split=0.3):
    train_idx, val_idx = train_test_split(list(range(len(dataset))), test_size=val_split)
    datasets = {}
    datasets['train'] = Subset(dataset, train_idx)
    datasets['val'] = Subset(dataset, val_idx)
    return datasets


def generate_dataset(path,transformer,train_val_split):
    dataSet = datasets.ImageFolder(path,transformer,is_valid_file=check_valid)
    dataSetSplit = train_val_dataset(dataSet,val_split = train_val_split)
    dataLoaders = {x: torch.utils.data.DataLoader(dataSetSplit[x], batch_size=4,
                                              shuffle=True, num_workers=4)
                    for x in ['train', 'val']}
    return (dataSet,dataSetSplit,dataLoaders)