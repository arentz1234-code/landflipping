'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Deal, DealStage } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import {
  DEAL_STAGE_COLORS,
  DEAL_STAGE_LABELS,
  DEAL_STAGES,
  PRIORITY_COLORS,
  formatCurrency,
  formatAcreage,
  daysUntil,
} from '@/lib/utils';
import toast from 'react-hot-toast';

interface DealWithRelations extends Omit<Deal, 'property' | 'assigned_member'> {
  property?: { county: string; state: string; acreage: number } | null;
  assigned_member?: { full_name: string } | null;
}

interface PipelineBoardProps {
  deals: DealWithRelations[];
  userId: string;
}

export function PipelineBoard({ deals, userId }: PipelineBoardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  const pipelineStages: DealStage[] = ['lead', 'contacted', 'offer_made', 'negotiating', 'under_contract', 'due_diligence', 'closed_won', 'closed_lost'];

  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStage: DealStage) => {
    e.preventDefault();
    if (!draggedDeal) return;

    const deal = deals.find(d => d.id === draggedDeal);
    if (!deal || deal.stage === newStage) {
      setDraggedDeal(null);
      return;
    }

    const oldStage = deal.stage;

    try {
      // Update deal stage
      const { error: dealError } = await supabase
        .from('deals')
        .update({ stage: newStage })
        .eq('id', draggedDeal);

      if (dealError) throw dealError;

      // Log activity
      await supabase.from('activity_log').insert({
        activity_type: 'status_change',
        subject: `Deal moved from ${DEAL_STAGE_LABELS[oldStage]} to ${DEAL_STAGE_LABELS[newStage]}`,
        deal_id: draggedDeal,
        logged_by: userId,
      });

      toast.success(`Moved to ${DEAL_STAGE_LABELS[newStage]}`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update deal');
    } finally {
      setDraggedDeal(null);
    }
  };

  const getDealsByStage = (stage: DealStage) => {
    return deals.filter(d => d.stage === stage);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {pipelineStages.map((stage) => {
          const stageDeals = getDealsByStage(stage);
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.agreed_price || d.offer_amount || 0), 0);

          return (
            <div
              key={stage}
              className="w-72 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {DEAL_STAGE_LABELS[stage]}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {stageDeals.length} deals • {formatCurrency(stageValue)}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-400">{stageDeals.length}</span>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {stageDeals.map((deal) => {
                    const daysToClose = daysUntil(deal.closing_date);
                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={() => handleDragStart(deal.id)}
                        className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow ${
                          draggedDeal === deal.id ? 'opacity-50' : ''
                        }`}
                      >
                        <Link href={`/deals/${deal.id}`}>
                          <h4 className="font-medium text-gray-900 text-sm mb-2 hover:text-blue-600">
                            {deal.title}
                          </h4>
                        </Link>

                        {deal.property && (
                          <p className="text-xs text-gray-500 mb-2">
                            {deal.property.county}, {deal.property.state} • {formatAcreage(deal.property.acreage)}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(deal.agreed_price || deal.offer_amount)}
                          </span>
                          <Badge className={PRIORITY_COLORS[deal.priority]}>
                            {deal.priority}
                          </Badge>
                        </div>

                        {deal.closing_date && daysToClose !== null && (
                          <p className={`text-xs ${daysToClose <= 7 ? 'text-orange-600 font-medium' : daysToClose < 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {daysToClose === 0 ? 'Closing today' : daysToClose > 0 ? `Closing in ${daysToClose} days` : `${Math.abs(daysToClose)} days overdue`}
                          </p>
                        )}

                        {deal.assigned_member && (
                          <div className="mt-2 pt-2 border-t flex items-center gap-2">
                            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
                              {deal.assigned_member.full_name.charAt(0)}
                            </div>
                            <span className="text-xs text-gray-500">{deal.assigned_member.full_name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
