from PIL import Image, ImageFile
import torch
from torch.autograd import Variable
from torchvision import transforms
ImageFile.LOAD_TRUNCATED_IMAGES = True

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

class_names = ['bandaid',
 'battery',
 'bottles',
 'bulb',
 'cans',
 'cardboard-box',
 'cigarette-butt',
 'computer',
 'cups',
 'diapers',
 'electrical-cables',
 'face-masks',
 'gloves',
 'medicines',
 'organic',
 'paper',
 'plastic-bag',
 'smartphones',
 'syringe',
 'tetra-pack',
 'thermometer',
 'toothbrush']

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

print("Loading model")
vgg16_all_simply= torch.load('./models/model_vgg_all_simply.pt')
vgg16_all_simply.eval()
print("Model Loaded")

min_img_size = 256

transform_pipeline = transforms.Compose([transforms.Resize((min_img_size,min_img_size)),
                                         transforms.Grayscale(num_output_channels=3),
                                         transforms.ToTensor(),
                                         transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                                              std=[0.229, 0.224, 0.225])])

def pred_image(model,img_path,class_names,transform_pipeline,show_image=False,device="cpu"):
    print(device)
    print("Reading image")
    image = Image.open(img_path)

    image_transformed = transform_pipeline(image).to(device)
    image_transformed = image_transformed.unsqueeze(0)
    image_transformed = Variable(image_transformed)

    prediction = model(image_transformed.float())  # Returns a Tensor of shape (batch, num class labels)
    predicted_idx = prediction.data.cpu().numpy().argmax() # Our prediction will be the index of the class label with the largest value.
    probability = round(float(prediction.data.cpu().numpy().max()),1)

    return (f"Predicted Index : {predicted_idx}, Class : {class_names[predicted_idx]}, Confidence Level : {probability}%")

def get_pred(img_path):
    return pred_image(vgg16_all_simply,img_path,class_names,transform_pipeline, show_image = True,device = device)

print(get_pred('./images/img.jpg'))