import React from 'react';
import Card from './Card';
import { IoReceiptOutline } from 'react-icons/io5';

export const EmptyState = ({
  title = 'No data found',
  description = 'Add some items or adjust your filters to see details here.',
  icon = IoReceiptOutline,
  action
}) => {
  const IconComponent = icon;
  return (
    <Card className="empty-state-card flex-center">
      <div className="empty-state-content">
        <div className="empty-state-icon-wrapper">
          <IconComponent className="empty-state-icon" />
        </div>
        <h4 className="empty-state-title">{title}</h4>
        <p className="empty-state-description">{description}</p>
        {action && <div className="empty-state-action">{action}</div>}
      </div>
    </Card>
  );
};

export default EmptyState;
