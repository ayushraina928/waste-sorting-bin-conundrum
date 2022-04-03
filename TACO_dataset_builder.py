import os
import numpy as np
import torch
import torch.utils.data
import json
from PIL import Image
from pycocotools.coco import COCO
import torchvision.transforms as T

class builder(torch.utils.data.Dataset):
    def __init__(self, root, resize_size=None, transforms=None):
        self.root = root
        self.resize_size = resize_size
        self.transforms = transforms
        # load all image files, sorting them to
        # ensure that they are aligned
        self.coco = COCO(os.path.join(root, 'data','annotations.json'))
        file = open(os.path.join(root,'data/annotations.json'))
        self.TACOannotations = json.load(file)
        self.imgMap = {}
        self.annotationsMap = {}
        self.imgs = []
        for x in range(1,16):
            batch_folder = "data/batch_" + str(x)
            imgs_for_batch =  list(sorted(os.listdir(os.path.join(root, batch_folder))))
            for img in imgs_for_batch:
                self.imgs.append("batch_"+str(x)+"/"+img)

        for img in self.TACOannotations['images']:
            self.imgMap[img['file_name']] = {
                'image_id' : img['id'],
                'width' : img['width'],
                'height' : img['height']
            }

        for annotation in self.TACOannotations['annotations']:
            if annotation['image_id'] not in self.annotationsMap:
                self.annotationsMap[annotation['image_id']] = []
            self.annotationsMap[annotation['image_id']].append(annotation)

    def __getitem__(self, idx):
        # load images 
        img_path = os.path.join(self.root, "data", self.imgs[idx])
        img = Image.open(img_path).convert("RGB")
        original_size = img.size
        
        if self.resize_size is not None:
            img = T.Resize(size=self.resize_size)(img)
        
        image_id = self.imgMap[self.imgs[idx]]['image_id']

        anns_obj = self.annotationsMap[image_id]
        
        if self.resize_size is not None:
            scaleX = self.resize_size[1]/original_size[0]
            scaleY = self.resize_size[0]/original_size[1]
            
            for ann in anns_obj:
                ann["area"] *= (scaleX * scaleY)
                
                ann["bbox"][0] *= scaleX
                ann["bbox"][1] *= scaleY
                ann["bbox"][2] *= scaleX
                ann["bbox"][3] *= scaleY

        bboxes = [[ann['bbox'][0],ann['bbox'][1],ann['bbox'][0]+ann['bbox'][2],
                   ann['bbox'][1]+ann['bbox'][3]] for ann in anns_obj]
        
        #Convert segmentation object into mask 
        #that will be needed for the MaskRCNN model
        masks = [self.coco.annToMask(ann) for ann in anns_obj]
        
        areas = [ann['area'] for ann in anns_obj]
        labels = [ann['category_id'] for ann in anns_obj]

        boxes = torch.as_tensor(bboxes, dtype=torch.float32)
        #labels = torch.ones(len(anns_obj), dtype=torch.int64)
        labels = torch.as_tensor(labels)
        masks = torch.as_tensor(masks, dtype=torch.uint8)
        if self.resize_size is not None:
            masks = T.Resize(size=self.resize_size)(masks)
        image_id = torch.tensor([image_id])
        area = torch.as_tensor(areas)
        iscrowd = torch.zeros(len(anns_obj), dtype=torch.int64)

        target = {}
        target["boxes"] = boxes
        target["labels"] = labels
        target["masks"] = masks
        target["image_id"] = image_id
        target["area"] = area
        target["iscrowd"] = iscrowd

        if self.transforms is not None:
            img, target = self.transforms(img, target)

        return img, target

    def __len__(self):
        return len(self.imgs)