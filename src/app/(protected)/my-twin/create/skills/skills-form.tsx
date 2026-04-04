'use client';

import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WizardSkill } from '@/lib/wizard-storage';
import { saveSkillsAction } from '../actions';

export function SkillsForm({ defaultSkills }: { defaultSkills: WizardSkill[] }) {
  const [skills, setSkills] = useState<WizardSkill[]>(defaultSkills);

  function addSkill() {
    setSkills([...skills, { title: '', content: '' }]);
  }

  function removeSkill(index: number) {
    setSkills(skills.filter((_, i) => i !== index));
  }

  function updateSkill(index: number, field: keyof WizardSkill, value: string) {
    setSkills(skills.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit() {
    const filtered = skills.filter((s) => s.title.trim() && s.content.trim());
    await saveSkillsAction(JSON.stringify(filtered));
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-medium'>Skills</h2>
        <p className='text-sm text-muted-foreground'>
          Define what your twin can do. You can skip this step and add skills later.
        </p>
      </div>

      <div className='space-y-4'>
        {skills.map((skill, i) => (
          <div key={i} className='space-y-3 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <Label htmlFor={`skill-title-${i}`}>Skill {i + 1}</Label>
              <Button type='button' variant='ghost' size='icon' onClick={() => removeSkill(i)}>
                <Trash2 className='size-4 text-muted-foreground' />
              </Button>
            </div>
            <Input
              id={`skill-title-${i}`}
              placeholder='Skill title'
              value={skill.title}
              onChange={(e) => updateSkill(i, 'title', e.target.value)}
            />
            <Textarea
              placeholder='Describe what this skill does...'
              value={skill.content}
              onChange={(e) => updateSkill(i, 'content', e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>

      <Button type='button' variant='outline' onClick={addSkill} className='w-full'>
        <Plus className='size-4' />
        Add Skill
      </Button>

      <div className='flex justify-between'>
        <Button variant='outline' asChild>
          <Link href='/my-twin/create/persona'>&larr; Back</Link>
        </Button>
        <Button type='button' onClick={handleSubmit}>
          Next &rarr;
        </Button>
      </div>
    </div>
  );
}
