import React from 'react';
import { Modal, Input } from 'antd';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/LanguageContext';

const CommandPalette = ({ open, onCancel, items, searchQuery, setSearchQuery }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            closable={false}
            width={600}
            className='command-palette-modal'
            centered
        >
            <div className='command-search-header'>
                <SearchOutlined style={{ fontSize: '20px', color: 'var(--admin-primary)' }} />
                <Input
                    placeholder={t('admin_search_placeholder')}
                    variant='borderless'
                    className='command-search-input'
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className='command-results'>
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className='command-item'
                            onClick={() => { navigate(item.key); onCancel(); setSearchQuery(''); }}
                        >
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(193, 53, 132, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-primary)' }}>
                                {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4>{item.label}</h4>
                                <p>{item.desc}</p>
                            </div>
                            <ArrowRightOutlined style={{ opacity: 0.3 }} />
                        </button>
                    ))
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        {t('admin_no_results')} "{searchQuery}"
                    </div>
                )}
            </div>
            <div className='command-footer'>
                <span><span className='kbd'>↵</span> {t('admin_select_hint')}</span>
                <span><span className='kbd'>esc</span> {t('admin_close_hint')}</span>
            </div>
        </Modal>
    );
};

export default CommandPalette;
