import React, { useState, useMemo, useEffect } from 'react';
import { Table, Typography, Tag, Space, Input, Select, Avatar } from 'antd';
import { SyncOutlined, UserOutlined, FilterOutlined, SortAscendingOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';
import { useLanguage } from '@/store/LanguageContext';
import { useUsers } from '@/features/users/hooks/useUsers';
import { PageWrapper, Skeleton, Pagination, EmptyState, CButton } from '@/components/common';
import useQueryParams from '@/hooks/useQueryParams';
import { useDebounce } from '@/hooks/useDebounce';
// moved to bottom

const { Text } = Typography;
const { Search } = Input;
import '@/admin-list.css';

const UserList = () => {
    const { t } = useLanguage();
    const [query, setQuery] = useQueryParams();
    
    const roleFilter = query.role || undefined;
    const searchText = query.search || '';
    const [searchInput, setSearchInput] = useState(searchText);
    const debouncedSearch = useDebounce(searchInput, 500);

    const currentPage = query.page ? Number(query.page) : 1;
    const pageSize = 10;

    const { data: users = [], isLoading, refetch } = useUsers(roleFilter);

    useEffect(() => {
        if (!searchText) setSearchInput('');
    }, [searchText]);

    useEffect(() => {
        if (debouncedSearch !== searchInput) return;

        const cleanSearch = String(debouncedSearch ?? '').trim();
        if (cleanSearch !== searchText) {
            setQuery({ search: cleanSearch || null, page: 1 });
        }
    }, [debouncedSearch, searchInput, searchText, setQuery]);

    const filteredUsers = useMemo(() => {
        const lowerSearch = searchText.toLowerCase();
        return users.filter(user => 
            !searchText || 
            (user.firstname && user.firstname.toLowerCase().includes(lowerSearch)) ||
            (user.lastname && user.lastname.toLowerCase().includes(lowerSearch)) ||
            (user.email && user.email.toLowerCase().includes(lowerSearch))
        );
    }, [users, searchText]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    const roleOptions = [
        { label: t('all'), value: null },
        { label: t('admin_user_role_admin'), value: 'admin' },
        { label: t('admin_user_role_user'), value: 'user' },
    ];

    const columns = [
        {
            title: t('admin_user_id'),
            dataIndex: 'userId',
            key: 'userId',
            width: 100,
            align: 'center',
            render: (id) => <span className="admin-table-id">#{id.substring(0, 8)}...</span>
        },
        {
            title: t('full_name'),
            key: 'fullName',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <Text strong>{`${record.firstname || ''} ${record.lastname || ''}`}</Text>
                </Space>
            )
        },
        {
            title: t('admin_user_email'),
            dataIndex: 'email',
            key: 'email',
            width: 250,
        },
        {
            title: t('admin_user_role'),
            dataIndex: 'userRole',
            key: 'userRole',
            width: 120,
            align: 'center',
            render: (role) => {
                const isAdmin = role?.toLowerCase() === 'admin';
                return (
                    <Tag color={isAdmin ? 'gold' : 'blue'} className="admin-table-tag">
                        {isAdmin ? t('admin_user_role_admin') : t('admin_user_role_user')}
                    </Tag>
                );
            }
        },
        {
            title: t('phone'),
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 150,
        },
        {
            title: t('dob'),
            dataIndex: 'dob',
            key: 'dob',
            width: 120,
        }
    ];

    const handleResetFilters = () => {
        setQuery({ page: null, search: null, role: null });
        setSearchInput('');
        refetch();
    };

    return (
        <div className="admin-list-container">
            <PageWrapper
                title={t('admin_home_users_title')}
                subtitle={<Text type="secondary">{t('total')} • <Text strong className="admin-subtitle-count">{filteredUsers.length}</Text> {t('admin_unit_person')}</Text>}
                extra={
                    <div className="admin-header-buttons">
                        <CButton type="secondary" icon={<SyncOutlined />} onClick={handleResetFilters} loading={isLoading}>
                            {t('admin_user_refresh')}
                        </CButton>
                    </div>
                }
            >
                <div className="admin-filter-bar">
                    <div className="admin-filter-left">
                        <Input
                            placeholder={t('admin_users_search')}
                            allowClear
                            className="admin-toolbar-search admin-unified-input"
                            value={searchInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchInput(val);
                                if (!val) {
                                    setQuery({ search: null, page: 1 });
                                }
                            }}
                            onPressEnter={() => setQuery({ search: searchInput?.trim() || null, page: 1 })}
                            suffix={<SearchOutlined style={{ color: 'var(--admin-primary)', fontSize: '18px', cursor: 'pointer' }} onClick={() => setQuery({ search: searchInput?.trim() || null, page: 1 })} />}
                        />
                        <div className="admin-select-wrapper">
                            <Select
                                allowClear
                                placeholder={t('admin_user_role')}
                                options={roleOptions}
                                onChange={(v) => setQuery({ role: v || null, page: 1 })}
                                className="admin-toolbar-select admin-custom-select"
                                value={roleFilter}
                                suffixIcon={
                                    <div className="admin-select-suffix">
                                        <FilterOutlined style={{ color: 'var(--admin-primary)', fontSize: '16px' }} />
                                        <DownOutlined style={{ fontSize: '12px', opacity: 0.6 }} />
                                    </div>
                                }
                                variant="borderless"
                            />
                        </div>
                    </div>
                    <div className="admin-toolbar-right">
                        <div className="admin-select-wrapper">
                            <Select
                                placeholder={t('sort_default')}
                                defaultValue="default"
                                className="admin-toolbar-select admin-custom-select"
                                suffixIcon={
                                    <div className="admin-select-suffix">
                                        <SortAscendingOutlined style={{ color: 'var(--admin-primary)', fontSize: '16px' }} />
                                        <DownOutlined style={{ fontSize: '12px', opacity: 0.6 }} />
                                    </div>
                                }
                                variant="borderless"
                                options={[
                                    { value: 'default', label: t('sort_default') },
                                    { value: 'newest', label: t('sort_time_newest') },
                                    { value: 'oldest', label: t('sort_time_oldest') }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="admin-table-wrapper">
                    {isLoading ? (
                        <div style={{ padding: 24 }}>
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} width="100%" height="60px" borderRadius="16px" style={{ marginBottom: 16 }} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                dataSource={paginatedUsers}
                                rowKey="userId"
                                className="beauty-table"
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                onRow={(record) => ({
                                    className: "admin-table-row-pointer"
                                })}
                                locale={{ emptyText: <EmptyState title={t('no_data')} /> }}
                            />
                            {filteredUsers.length > pageSize && (
                                <div className="admin-custom-pagination">
                                    <Pagination
                                        page={currentPage}
                                        totalPages={Math.ceil(filteredUsers.length / pageSize)}
                                        totalItems={filteredUsers.length}
                                        pageSize={pageSize}
                                        onPageChange={(page) => {
                                            setQuery({ page: page });
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </PageWrapper>
        </div>
    );
};

export default UserList;
