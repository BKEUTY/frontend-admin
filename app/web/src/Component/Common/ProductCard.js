import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Rate, Typography, Space } from 'antd';
import placeHolderImg from '../../Assets/Images/Products/product_placeholder.svg';
import { getImageUrl } from '../../api/axiosClient';
import './ProductCard.css';

const { Text, Title } = Typography;

const ProductCard = ({ product, t, language, onClickData }) => {
    const navigate = useNavigate();

    const idForDetail = product.id;
    const name = product.name;
    const rawPrice = product.minPrice || 0;
    const price = typeof rawPrice === 'number' ? `${rawPrice.toLocaleString("vi-VN")}đ` : rawPrice;
    const brand = product.brand || 'BKEUTY';
    const image = product.image ? getImageUrl(product.image) : placeHolderImg;
    const rating = parseFloat(product.rating || 4.8);

    let sold = product.sold || 120;
    if (typeof sold === 'string') {
        const parsed = parseInt(sold.replace(/\D/g, ''));
        if (!isNaN(parsed)) sold = parsed;
    }

    const discount = product.discount;
    const tag = product.tag;

    const handleClick = () => {
        const path = `/admin/products/${idForDetail}`;
        navigate(path, { state: onClickData });
    };

    const CardContent = (
        <Card
            hoverable
            className="product-card-antd"
            cover={
                <div className="card-image-wrapper">
                    <img alt={name} src={image} onError={(e) => { e.target.src = placeHolderImg }} loading="lazy" />
                </div>
            }
            onClick={handleClick}
            bordered={false}
        >
            <div className="card-info">
                <Text type="secondary" className="card-brand">{brand.toUpperCase()}</Text>
                <Title level={5} className="card-name" ellipsis={{ rows: 2 }}>{name}</Title>

                <Space size="small" align="center" className="card-rating">
                    <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: 12, color: '#fadb14' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>({sold})</Text>
                </Space>

                <div className="price-row">
                    {product.oldPrice && <Text delete className="old-price">{product.oldPrice}</Text>}
                    <Text className="card-price">{price}</Text>
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
