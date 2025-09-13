# 装备图片说明

## 图片存放位置
将装备图片放在此目录下，文件命名规范如下：

## 建议的图片文件名
- `basketball.jpg` - 篮球图片
- `badminton.jpg` - 羽毛球拍图片
- `running-shoes.jpg` - 跑步鞋图片
- `yoga-mat.jpg` - 瑜伽垫图片
- `dumbbells.jpg` - 哑铃套装图片
- `tennis.jpg` - 网球拍图片

## 图片规格建议
- 尺寸：建议 400x300px 或更高分辨率
- 格式：JPG、PNG、WebP
- 文件大小：建议控制在 200KB 以内以保证加载速度

## 使用说明
1. 将你的装备图片放入此目录
2. 确保文件名与代码中的路径匹配
3. 如果需要添加新装备，请在 `EquipmentSharing.vue` 的 `equipmentList` 数组中添加对应的条目

## 路径说明
在代码中，图片路径使用 `/assets/images/equipment/filename.jpg` 格式，这将指向 `public/assets/images/equipment/` 目录下的文件。
