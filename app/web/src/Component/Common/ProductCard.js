import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Rate, Typography, Space, Tag } from 'antd';
import { getImageUrl } from '../../api/axiosClient';
import './ProductCard.css';

import dummy1 from '../../Assets/Images/Products/product_dummy_1.jpg';
import dummy2 from '../../Assets/Images/Products/product_dummy_2.jpg';
import dummy3 from '../../Assets/Images/Products/product_dummy_3.jpg';
import dummy4 from '../../Assets/Images/Products/product_dummy_4.jpg';
import dummy5 from '../../Assets/Images/Products/product_dummy_5.svg';

const dummyImages = [dummy1, dummy2, dummy3, dummy4, dummy5];
const getRandomImage = () => dummyImages[Math.floor(Math.random() * dummyImages.length)];

const { Text, Title } = Typography;

const ProductCard = ({ product, t, language, onClickData }) => {
    const navigate = useNavigate();
    const fallbackImg = useMemo(() => getRandomImage(), []);

    const idForDetail = product.id;
    const name = product.name;
    const rawPrice = product.price !== undefined ? product.price : (product.minPrice || 0);
    const price = typeof rawPrice === 'number' ? `${rawPrice.toLocaleString("vi-VN")}đ` : rawPrice;
    const brand = product.brand || 'BKEUTY';
    const image = product.image ? getImageUrl(product.image) : fallbackImg;
    const rating = parseFloat(product.rating || 4.8);
    const stockQuantity = product.stockQuantity || 0;

    // Trích xuất danh mục đầu tiên để hiển thị trên thẻ card
    const firstCategory = product.categories && product.categories.length > 0 
        ? (typeof product.categories[0] === 'object' ? product.categories[0].categoryName : product.categories[0])
        : null;

    let sold = product.sold || 120;
    if (typeof sold === 'string') {
        const parsed = parseInt(sold.replace(/\D/g, ''));
        if (!isNaN(parsed)) sold = parsed;
    }

    const discount = product.discount;
    const tag = product.tag;

    const handleClick = () => {
        const path = `/admin/products/${idForDetail}`;
        navigate(path, { 
            state: { 
                ...onClickData, 
                productId: product.parentId || product.originalId || product.id, 
                variantId: product.originalId 
            } 
        });
    };

    const CardContent = (
        <Card
            hoverable
            className="product-card-antd product-card"
            cover={
                <div className="card-image-wrapper">
                    <img alt={name} src={image} onError={(e) => { e.target.src = fallbackImg }} loading="lazy" />
                </div>
            }
            onClick={handleClick}
            bordered={false}
        >
            <div className="card-info">
                <Space size="small" className="card-brand-cat">
                    <Text type="secondary" className="card-brand">{brand.toUpperCase()}</Text>
                    {firstCategory && <Tag color="default" className="card-cat-tag">{firstCategory}</Tag>}
                </Space>
                
                <Title level={5} className="card-name" ellipsis={{ rows: 2 }}>{name}</Title>

                <Space size="small" align="center" className="card-rating">
                    <Rate disabled defaultValue={rating} allowHalf className="card-rating-stars" />
                    <Text type="secondary" className="card-sold-count">({sold})</Text>
                </Space>

                <div className="price-stock-row">
                    <div className="price-col">
                        {product.oldPrice && <Text delete className="card-old-price">{product.oldPrice}</Text>}
                        <Text className="card-price">{price}</Text>
                    </div>
                    <Tag color={stockQuantity > 0 ? 'green' : 'red'} className="stock-tag">
                        {stockQuantity > 0 ? `${t('in_stock')} ${stockQuantity}` : t('out_of_stock_btn')}
                    </Tag>
                </div>
            </div>
        </Card>
    );

    if (discount || tag) {
        return (
            <Badge.Ribbon text={discount ? `-${discount}` : tag} color={discount ? 'gold' : 'pink'}>
                {CardContent}
            </Badge.Ribbon>
        );
    }

    return CardContent;
};

export default ProductCard;
