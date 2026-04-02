import React, { useState } from 'react';
import { Table, Tag, Button, Modal, Input, message, Rate, Avatar, Space, Tooltip, Select } from 'antd';
import { MessageOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminReviewApi from '../../../api/adminReviewApi';
import publicReviewApi from '../../../api/publicReviewApi';
import adminProductApi from '../../../api/adminProductApi';
import './ReviewList.css';

const { TextArea } = Input;
const { Option } = Select;

const ReviewList = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyComment, setReplyComment] = useState('');

    const { data: productsData } = useQuery({
        queryKey: ['adminProductsList'],
        queryFn: async () => {
            const response = await adminProductApi.getAll({ size: 1000 });
            return response.data;
        }
    });

    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['adminReviews', page, pageSize, selectedVariantId],
        queryFn: async () => {
            if (!selectedVariantId) return { content: [], totalElements: 0, totalPages: 0 };
            const response = await publicReviewApi.getReviewsByVariantId(selectedVariantId, { page, size: pageSize });
            return response.data;
        },
        enabled: !!selectedVariantId
    });

    const replyMutation = useMutation({
        mutationFn: ({ reviewId, comment }) => adminReviewApi.replyToReview(reviewId, comment),
        onSuccess: () => {
            message.success('Phản hồi thành công!');
            setIsReplyModalVisible(false);
            setReplyComment('');
            queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
        }
    });

    const updateReplyMutation = useMutation({
        mutationFn: ({ replyId, comment }) => adminReviewApi.updateReply(replyId, comment),
        onSuccess: () => {
            message.success('Cập nhật phản hồi thành công!');
            setIsReplyModalVisible(false);
            setReplyComment('');
            queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
        }
    });

    const deleteReplyMutation = useMutation({
        mutationFn: (replyId) => adminReviewApi.deleteReply(replyId),
        onSuccess: () => {
            message.success('Đã xóa phản hồi.');
            queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
        }
    });

    const handleReply = (record) => {
        setSelectedReview(record);
        setReplyComment(record.reply?.comment || '');
        setIsReplyModalVisible(true);
    };

    const handleSubmitReply = () => {
        if (!replyComment.trim()) {
            message.warning('Vui lòng nhập nội dung phản hồi!');
            return;
        }

        if (selectedReview.reply) {
            updateReplyMutation.mutate({ replyId: selectedReview.reply.id, comment: replyComment });
        } else {
            replyMutation.mutate({ reviewId: selectedReview.id, comment: replyComment });
        }
    };

    const columns = [
        {
            title: 'Khách hàng',
            dataIndex: 'userName',
            key: 'userName',
            render: (name, record) => (
                <Space>
                    <Avatar>{name?.charAt(0)}</Avatar>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>ID: {record.userId}</div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => <Rate disabled defaultValue={rating} style={{ fontSize: '14px' }} />
        },
        {
            title: 'Nội dung',
            dataIndex: 'comment',
            key: 'comment',
            width: 350,
            render: (text, record) => (
                <div>
                    <div className="review-text-admin">{text}</div>
                    {record.images && record.images.length > 0 && (
                        <div className="review-images-admin">
                            {record.images.map((img, i) => <img key={i} src={img} alt="rev" />)}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'center',
            render: (_, record) => (
                record.isReplied ? 
                <Tag icon={<CheckCircleOutlined />} color="success">Đã phản hồi</Tag> : 
                <Tag icon={<ClockCircleOutlined />} color="warning">Chưa phản hồi</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Phản hồi">
                        <Button 
                            type="text" 
                            icon={<MessageOutlined />} 
                            onClick={() => handleReply(record)} 
                            className="admin-action-btn edit-btn"
                        />
                    </Tooltip>
                    {record.reply && (
                        <Tooltip title="Xóa phản hồi">
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                onClick={() => deleteReplyMutation.mutate(record.reply.id)} 
                                className="admin-action-btn delete-btn"
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="admin-list-container">
            <div className="admin-list-header" style={{ marginBottom: '24px' }}>
                <h2 className="admin-list-title">Quản lý đánh giá</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>Chọn sản phẩm:</span>
                    <Select
                        showSearch
                        style={{ width: 300 }}
                        placeholder="Chọn sản phẩm để xem đánh giá"
                        optionFilterProp="children"
                        onChange={(val) => { setSelectedVariantId(val); setPage(0); }}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {productsData?.content?.map(prod => (
                            <Option key={prod.id} value={prod.id}>{prod.name}</Option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <Table
                    columns={columns}
                    dataSource={reviewsData?.content || []}
                    rowKey="id"
                    loading={isLoading}
                    locale={{ emptyText: selectedVariantId ? 'Không có đánh giá nào cho sản phẩm này' : 'Vui lòng chọn sản phẩm để xem đánh giá' }}
                    pagination={{
                        current: page + 1,
                        pageSize: pageSize,
                        total: reviewsData?.totalElements || 0,
                        onChange: (p, s) => { setPage(p - 1); setPageSize(s); }
                    }}
                    className="beauty-table"
                />
            </div>

            <Modal
                title={selectedReview?.reply ? "Cập nhật phản hồi" : "Phản hồi đánh giá"}
                open={isReplyModalVisible}
                onOk={handleSubmitReply}
                onCancel={() => setIsReplyModalVisible(false)}
                okText="Gửi"
                cancelText="Hủy"
                confirmLoading={replyMutation.isPending || updateReplyMutation.isPending}
            >
                <div style={{ marginBottom: '15px' }}>
                    <strong>Khách hàng:</strong> {selectedReview?.userName}
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <strong>Đánh giá:</strong> <Rate disabled defaultValue={selectedReview?.rating} />
                </div>
                <div style={{ marginBottom: '15px', fontStyle: 'italic', color: '#666' }}>
                    "{selectedReview?.comment}"
                </div>
                <TextArea
                    rows={4}
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    placeholder="Nhập nội dung phản hồi của Admin..."
                />
            </Modal>
        </div>
    );
};

export default ReviewList;
