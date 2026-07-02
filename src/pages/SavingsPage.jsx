import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { IoAddOutline } from 'react-icons/io5';
import GoalCard from '../components/Savings/GoalCard';
import GoalForm from '../components/Savings/GoalForm';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';

export const SavingsPage = () => {
  const { savingsGoals } = useFinance();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  return (
    <div className="savings-page flex-column gap-lg">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Define, contribute to, and celebrate your savings targets.</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddOpen(true)}
            icon={IoAddOutline}
          >
            Create Goal
          </Button>
        </div>
      </div>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <EmptyState
          title="No Savings Goals Set"
          description="Create your first savings target, log your weekly contributions, and track milestones!"
        />
      ) : (
        <div className="savings-goals-grid">
          {savingsGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create Savings Target"
        >
          <GoalForm onClose={() => setIsAddOpen(false)} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingGoal && (
        <Modal
          isOpen={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          title="Modify Savings Target"
        >
          <GoalForm initialData={editingGoal} onClose={() => setEditingGoal(null)} />
        </Modal>
      )}
    </div>
  );
};

export default SavingsPage;
