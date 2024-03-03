import { CodeSnippet, TransparentPanel } from '@/app/(webapp)/(components)'
import { ACTIVITY_DETAILS_PANEL } from '@/data/activityData'
import { ActivitySectionsProps } from '@/types/webappTypes/appTypes'
import React from 'react'

const ActivitySections = ({
  path,
  rawData
}: ActivitySectionsProps) => {

  const request = rawData?.request;
  const response = rawData?.response;

  const applyStyle = (key: string, value: any, depth = 0): string => {
    const indentation = ' '.repeat(depth * 2);

    if (typeof value === 'object' && value !== null) {
      const styledObject = Object.keys(value).map(innerKey => {
        const innerValue = value[innerKey];
        return applyStyle(innerKey, innerValue, depth + 1);
      });
      console.log(styledObject)
      if (!styledObject.length) return `${indentation}<span style='color: #FB8F8F;'>"${key}"</span>: {}`;
      return `${indentation}<span style='color: #FB8F8F;'>"${key}"</span>: {<br>${styledObject.join(',<br>')}<br>${indentation}}`;
    } else {
      return `${indentation}<span style='color: #FB8F8F;'>"${key}"</span>: <span style='color: #6CE9A6;'>${typeof value === "string" ? JSON.stringify(value) : value}</span>`;
    }
  };

  const transform = (obj: any) => {
    const style = Object.keys(obj).map(key => {
      const value = obj[key];
      return applyStyle(key, value, 1);
    });
    return `{<br>${style.join(',<br>')}${style.length > 0 ? '<br>' : ''}}`;
  };

  const rawCode = path == 'response' ? JSON.stringify({ response }, undefined, 4): JSON.stringify({ request }, undefined, 4);
  const codeElement = path == 'response' ? transform({ response }) : transform({ request });

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <TransparentPanel
        panel={ACTIVITY_DETAILS_PANEL}
        currentValue={path}
      />

      <div className='w-full flex flex-col h-fit'>
        <CodeSnippet
          rawCode={rawCode}
          codeElement={codeElement}
        />
      </div>
    </section>
  )
}

export default ActivitySections